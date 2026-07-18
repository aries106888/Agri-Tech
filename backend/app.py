"""
ShambaPoint Agri-Tech — Flask Backend API
==========================================
Endpoints:
  Auth       POST /api/auth/register
             POST /api/auth/login

  Products   GET  /api/products
             GET  /api/products/<id>

  Orders     GET  /api/orders
             POST /api/orders

  Logistics  GET  /api/logistics
             POST /api/logistics

  Cart       POST /api/cart

  M-Pesa ── STK Push (C2B – buyer pays)
             POST /api/payments/mpesa/stkpush
             POST /api/payments/mpesa/stkpush/query
             POST /api/payments/mpesa/callback          ← Safaricom hits this

  M-Pesa ── B2C (platform pays farmer / driver)
             POST /api/payments/mpesa/b2c
             POST /api/payments/mpesa/b2c/result        ← Safaricom hits this
             POST /api/payments/mpesa/b2c/timeout       ← Safaricom hits this

  M-Pesa ── Utilities
             POST /api/payments/mpesa/balance
             POST /api/payments/mpesa/transaction/status

  Webhook log
             GET  /api/payments/mpesa/transactions      ← admin view all callbacks
"""

import os
import sys

# Automatically add the virtual environment's site-packages path to sys.path
# to support running the script with the global Python interpreter.
venv_site_packages = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.venv', 'Lib', 'site-packages'))
if os.path.exists(venv_site_packages) and venv_site_packages not in sys.path:
    sys.path.insert(0, venv_site_packages)

import ssl
import json
import base64
import hmac
import hashlib
import random
import string
import time
import logging
from datetime import datetime

import requests
from flask import Flask, jsonify, request, send_from_directory, g
from flask_cors import CORS
from dotenv import load_dotenv
from typing import Any, cast
try:
    # pyrefly: ignore [missing-import]
    from flask_limiter import Limiter
    # pyrefly: ignore [missing-import]
    from flask_limiter.util import get_remote_address
except ImportError:
    class Limiter:
        def __init__(self, key_func=None, app=None, default_limits=None, storage_uri=None):
            pass
        def limit(self, limit_value, **kwargs):
            def decorator(f):
                return f
            return decorator
    def get_remote_address():
        return "127.0.0.1"



# Optional MySQL — install with: pip install PyMySQL
pymysql: Any = None
MYSQL_AVAILABLE: bool = False
try:
    import pymysql
    MYSQL_AVAILABLE = True
except ImportError:
    pymysql = None

# Flask request object is extended dynamically with current_user.
request = cast(Any, request)

# ─── LOAD ENV ─────────────────────────────────────────────────────────────────
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

app = Flask(__name__)
limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# ─── CORS ────────────────────────────────────────────────────────────────────
# ALLOWED_ORIGINS env var: comma-separated list of origins, e.g.:
#   http://localhost:5173,https://shambapoint.co.ke
_raw_origins = os.getenv(
    'ALLOWED_ORIGINS',
    'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:5000,https://incandescent-cocada-15c910.netlify.app'
)
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(',') if o.strip()]
DEVELOPMENT_MODE = os.getenv('FLASK_ENV') == 'development' or '--dev' in sys.argv
if DEVELOPMENT_MODE:
    CORS(app, resources={r"/api/*": {"origins": ALLOWED_ORIGINS}}, supports_credentials=False)
else:
    CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=True)

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
log = logging.getLogger(__name__)

# ─── DIST DIR (React build output) ───────────────────────────────────────────
# app.py lives in  <project_root>/backend/
# React builds to <project_root>/dist/
DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'dist'))

# ─── CONFIG ───────────────────────────────────────────────────────────────────
MPESA_ENV            = os.getenv('MPESA_ENV', 'sandbox')
CONSUMER_KEY         = os.getenv('MPESA_CONSUMER_KEY', '')
CONSUMER_SECRET      = os.getenv('MPESA_CONSUMER_SECRET', '')
SHORTCODE            = os.getenv('MPESA_SHORTCODE', '174379')
PASSKEY              = os.getenv('MPESA_PASSKEY', '')
CALLBACK_URL         = os.getenv('MPESA_CALLBACK_URL', 'http://127.0.0.1:5000/api/payments/mpesa/callback')

B2C_SHORTCODE        = os.getenv('MPESA_B2C_SHORTCODE', '600000')
B2C_INITIATOR_NAME   = os.getenv('MPESA_B2C_INITIATOR_NAME', 'testapi')
B2C_SECURITY_CRED    = os.getenv('MPESA_B2C_SECURITY_CREDENTIAL', '')
B2C_RESULT_URL       = os.getenv('MPESA_B2C_RESULT_URL', 'http://127.0.0.1:5000/api/payments/mpesa/b2c/result')
B2C_TIMEOUT_URL      = os.getenv('MPESA_B2C_TIMEOUT_URL', 'http://127.0.0.1:5000/api/payments/mpesa/b2c/timeout')

# Daraja base URLs
if MPESA_ENV == 'production':
    BASE_URL = 'https://api.safaricom.co.ke'
else:
    BASE_URL = 'https://sandbox.safaricom.co.ke'

AUTH_URL         = f'{BASE_URL}/oauth/v1/generate?grant_type=client_credentials'
STK_PUSH_URL     = f'{BASE_URL}/mpesa/stkpush/v1/processrequest'
STK_QUERY_URL    = f'{BASE_URL}/mpesa/stkpushquery/v1/query'
B2C_URL          = f'{BASE_URL}/mpesa/b2c/v1/paymentrequest'
BAL_URL          = f'{BASE_URL}/mpesa/accountbalance/v1/query'
TXN_STATUS_URL   = f'{BASE_URL}/mpesa/transactionstatus/v1/query'

# In-memory transaction store (replace with DB in production)
MPESA_TRANSACTIONS = []  # All STK & B2C callbacks logged here

# In-memory stores for new endpoints (replace with DB in production)
FARMER_PRODUCTS = {}   # farmer_id (str) -> list of product dicts
BUYER_ORDERS    = {}   # buyer_id (str) -> list of order dicts
DELIVERIES      = []   # all delivery records
ADMIN_USERS     = []   # users created by admin

# ─── AUTH / DB CONFIG ─────────────────────────────────────────────────────────────────────
# Roles allowed through the public /api/auth/register endpoint.
# Admin accounts are allowed in demo mode for account creation.
PUBLIC_SIGNUP_ROLES = {'farmer', 'buyer', 'logistics', 'admin'}

JWT_SECRET  = os.environ['JWT_SECRET']
JWT_EXPIRY  = 60 * 60 * 24 * 7  # 7 days in seconds

SUPABASE_URL         = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY     = os.getenv('SUPABASE_ANON_KEY')
SUPABASE_DB_PASSWORD = os.getenv('SUPABASE_DB_PASSWORD')

# ─── IN-MEMORY USER STORE (dev only — replace with MySQL in production) ────────
# key: email (lowercase) -> { id, name, email, phone, role, password_hash, county }
USERS_DB: dict = {}

# ─── HELPERS ──────────────────────────────────────────────────────────────────
def random_id(length=8):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

# ── HMAC-SHA256 signed token (stdlib only — no PyJWT dependency) ────────────────────

def make_token(user_id, role, name):
    """
    Token format: base64url(payload).hmac_sha256_hex
    Payload: { user_id, role (lowercase), name, exp }
    """
    payload = json.dumps({
        'user_id': user_id,
        'role':    role,   # always lowercase: 'farmer'|'buyer'|'logistics'|'admin'
        'name':    name,
        'exp':     int(time.time()) + JWT_EXPIRY,
    }, separators=(',', ':')).encode()
    b64 = base64.urlsafe_b64encode(payload).rstrip(b'=').decode()
    sig = hmac.new(JWT_SECRET.encode(), b64.encode(), hashlib.sha256).hexdigest()
    return f"{b64}.{sig}"


def decode_token(token_str):
    """Verify Supabase JWT via Auth API when active, fallback to local HMAC verification."""
    try:
        if token_str.startswith('Bearer '):
            token_str = token_str[7:]

        # If Supabase is active, verify via Supabase Auth GET /user
        if SUPABASE_URL and SUPABASE_ANON_KEY:
            try:
                headers = {
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {token_str}"
                }
                resp = requests.get(f"{SUPABASE_URL}/auth/v1/user", headers=headers, timeout=5)
                if resp.status_code == 200:
                    user_data = resp.json()
                    user_id = user_data.get('id')
                    user_metadata = user_data.get('user_metadata', {})
                    
                    # Fetch from profiles table to get latest role/name
                    db_prof = db_query("SELECT name, role FROM public.profiles WHERE id = %s", (user_id,))
                    if db_prof:
                        role = db_prof[0]['role']
                        name = db_prof[0]['name']
                    else:
                        role = user_metadata.get('role', 'buyer').lower()
                        name = user_metadata.get('name', '')

                    return {
                        "user_id": user_id,
                        "role": role,
                        "name": name
                    }
            except Exception as exc:
                log.error(f"[Auth] Supabase token verification failed: {exc}")

        # Local HMAC verification fallback
        parts = token_str.split('.')
        if len(parts) != 2:
            return None
        b64, sig = parts
        expected = hmac.new(JWT_SECRET.encode(), b64.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        padding = (4 - len(b64) % 4) % 4
        payload = json.loads(base64.urlsafe_b64decode(b64 + '=' * padding).decode())
        if payload.get('exp', 0) < int(time.time()):
            return None   # expired
        return payload
    except Exception:
        return None


# ── PBKDF2-HMAC-SHA256 password hashing (stdlib only — no bcrypt needed) ────────────

def hash_password(password):
    salt = os.urandom(16)
    dk   = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 200_000)
    return salt.hex() + ':' + dk.hex()


def check_password(password, stored_hash):
    """Constant-time verification."""
    try:
        salt_hex, dk_hex = stored_hash.split(':', 1)
        dk = hashlib.pbkdf2_hmac(
            'sha256', password.encode('utf-8'), bytes.fromhex(salt_hex), 200_000
        )
        return hmac.compare_digest(dk.hex(), dk_hex)
    except Exception:
        return False


# ── Supabase connection & Query Helpers ────────────────────────────────────────────────────────

def get_db_connection():
    """Return a pg8000 connection to Supabase PostgreSQL or None if not configured."""
    if not SUPABASE_DB_PASSWORD:
        return None
    try:
        import pg8000.dbapi  # type: ignore

        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE

        conn = pg8000.dbapi.connect(
            host="aws-0-eu-central-1.pooler.supabase.com",
            port=5432,
            database="postgres",
            user="postgres.hwhebeixeflsdshmgowc",
            password=SUPABASE_DB_PASSWORD,
            ssl_context=ssl_context
        )
        return conn
    except Exception as exc:
        log.error(f"[DB] Error connecting to Supabase database: {exc}")
        return None

def db_query(query, params=None):
    """Run a SELECT query and return list of dicts. Returns None if DB not active."""
    conn = get_db_connection()
    if not conn:
        return None
    try:
        cursor = conn.cursor()
        cursor.execute(query, params or ())
        # Convert row tuples to dictionaries
        if cursor.description is None:
            cursor.close()
            conn.close()
            return []

        columns = [desc[0] for desc in cursor.description or []]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return results
    except Exception as exc:
        log.error(f"[DB] Query error: {exc} | Query: {query}")
        return None

def db_execute(query, params=None):
    """Run an INSERT/UPDATE/DELETE query and commit. Returns True on success, False otherwise."""
    conn = get_db_connection()
    if not conn:
        return False
    try:
        conn.autocommit = True
        cursor = conn.cursor()
        cursor.execute(query, params or ())
        cursor.close()
        conn.close()
        return True
    except Exception as exc:
        log.error(f"[DB] Execute error: {exc} | Query: {query}")
        return False



from functools import wraps

def require_role(*roles):
    """
    Decorator: validates HMAC token and enforces one of the listed roles.
    Role comparison is case-insensitive.
    Sets request.current_user = {user_id, role, name} on success.
    """
    allowed = {r.lower() for r in roles}

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return jsonify({"error": "Missing authorization token"}), 401

            token_info = decode_token(auth_header)
            if not token_info:
                return jsonify({"error": "Invalid or expired token"}), 401

            if token_info.get('role', '').lower() not in allowed:
                return jsonify({"error": "Forbidden: insufficient permissions"}), 403

            setattr(request, 'current_user', token_info)
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def get_mpesa_token():
    """Fetch OAuth access token from Safaricom Daraja."""
    try:
        creds = base64.b64encode(f"{CONSUMER_KEY}:{CONSUMER_SECRET}".encode()).decode()
        resp = requests.get(
            AUTH_URL,
            headers={'Authorization': f'Basic {creds}', 'Content-Type': 'application/json'},
            timeout=15
        )
        resp.raise_for_status()
        token = resp.json().get('access_token')
        log.info(f"[M-Pesa] Token fetched: {token[:12]}...")
        return token
    except Exception as exc:
        log.error(f"[M-Pesa] Token error: {exc}")
        return None

def generate_stk_password(shortcode, passkey, timestamp):
    """
    STK Push password = Base64(Shortcode + Passkey + Timestamp)
    """
    raw = f"{shortcode}{passkey}{timestamp}"
    return base64.b64encode(raw.encode()).decode()

def fmt_phone(phone):
    """Normalise phone to 254XXXXXXXXX format."""
    phone = str(phone).strip().replace(' ', '').replace('-', '')
    if phone.startswith('0'):
        phone = '254' + phone[1:]
    elif phone.startswith('+'):
        phone = phone[1:]
    return phone

def log_transaction(txn_type, data):
    """Append transaction record to in-memory store."""
    record = {
        'id':        random_id(10),
        'type':      txn_type,
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        **data
    }
    MPESA_TRANSACTIONS.append(record)
    log.info(f"[TXN] {txn_type}: {json.dumps(data, default=str)}")
    return record

# ─── IN-MEMORY DATA ───────────────────────────────────────────────────────────
PRODUCTS = [
    {"id": 1,  "name": "Fresh Yellow Bananas", "price": "60",  "unit": "/kg",    "farmer": "Njoroge K.", "county": "Kisii",       "verified": True,  "lowStock": False, "image": "/images/banana.png"},
    {"id": 2,  "name": "Crisp Red Apples",     "price": "150", "unit": "/kg",    "farmer": "Wanjiku F.", "county": "Meru",        "verified": True,  "lowStock": False, "image": "/images/apple.png"},
    {"id": 3,  "name": "Sweet Ripe Mangoes",   "price": "120", "unit": "/kg",    "farmer": "Mutua J.",   "county": "Machakos",    "verified": False, "lowStock": True , "image": "/images/mango.png"},
    {"id": 4,  "name": "Juicy Oranges",        "price": "80",  "unit": "/kg",    "farmer": "Akinyi O.",  "county": "Kisumu",      "verified": True,  "lowStock": False, "image": "/images/orange.png"},
    {"id": 5,  "name": "Irish Potatoes",       "price": "45",  "unit": "/kg",    "farmer": "Mwangi J.",  "county": "Nakuru",      "verified": True,  "lowStock": False, "image": "/images/potatoes.png"},
    {"id": 6,  "name": "Grade A Tomatoes",     "price": "80",  "unit": "/kg",    "farmer": "Sarah K.",   "county": "Kiambu",      "verified": True,  "lowStock": True , "image": "/images/tomatoes.png"},
    {"id": 7,  "name": "Sweet Green Maize",    "price": "25",  "unit": "/pc",    "farmer": "Kibet E.",   "county": "Uasin Gishu", "verified": True,  "lowStock": False, "image": "/images/maize.png"},
    {"id": 8,  "name": "Sweet Watermelon",     "price": "120", "unit": "/pc",    "farmer": "Agnes L.",   "county": "Kajiado",     "verified": True,  "lowStock": False, "image": "/images/banana.png"},
    {"id": 9,  "name": "Leafy Spinach",        "price": "10",  "unit": "/bunch", "farmer": "Njoroge T.", "county": "Limuru",      "verified": False, "lowStock": False, "image": "/images/spinach.png"},
    {"id": 10, "name": "Sweet Pineapple",      "price": "150", "unit": "/pc",    "farmer": "Maina P.",   "county": "Thika",       "verified": True,  "lowStock": False, "image": "/images/pineapple.png"},
    {"id": 11, "name": "Organic Tomatoes",     "price": "35",  "unit": "/kg",    "farmer": "David K.",   "county": "Nakuru",      "verified": False, "lowStock": False, "image": "/images/tomatoes.png"},
    {"id": 12, "name": "Ripe Avocados",        "price": "30",  "unit": "/pc",    "farmer": "Wambui A.",  "county": "Kisumu",      "verified": True,  "lowStock": False, "image": "/images/avocado.png"},
]

DRIVERS = [
    {"id": 1, "name": "David Ochieng", "vehicle": "KCA 123Z (Isuzu FRR)",   "status": "available", "rate_per_km": 85, "phone": "254712345678"},
    {"id": 2, "name": "Peter Waweru",  "vehicle": "KBX 456Y (Mitsubishi)",  "status": "available", "rate_per_km": 90, "phone": "254701234567"},
    {"id": 3, "name": "James Kimani",  "vehicle": "KDA 789W (Toyota Dyna)", "status": "on_trip",   "rate_per_km": 80, "phone": "254722987654"},
]

ORDERS = []

# ═══════════════════════════════════════════════════════════════════════════════
#  ROUTES
# ═══════════════════════════════════════════════════════════════════════════════

# ─── ROOT ─────────────────────────────────────────────────────────────────────
@app.route('/', methods=['GET'])
def home():
    return send_from_directory(DIST_DIR, 'index.html')

@app.route('/index.html', methods=['GET'])
def serve_index_explicit():
    return send_from_directory(DIST_DIR, 'index.html')

@app.route('/assets/<path:path>', methods=['GET'])
def serve_assets(path):
    return send_from_directory(os.path.join(DIST_DIR, 'assets'), path)

@app.route('/<path:path>', methods=['GET'])
def serve_spa_or_static(path):
    # API paths that fall through to this catch-all don't exist
    if path.startswith('api'):
        return jsonify({"error": "Route not found. Visit /api for available routes."}), 404

    # Serve exact static file if it exists (favicon.svg, icons.svg, images/, etc.)
    if os.path.exists(os.path.join(DIST_DIR, path)):
        return send_from_directory(DIST_DIR, path)

    # Fallback to index.html for React SPA client-side routing
    return send_from_directory(DIST_DIR, 'index.html')

@app.route('/api', methods=['GET'])
def index():
    if not DEVELOPMENT_MODE:
        auth_header = request.headers.get('Authorization')
        token_info = decode_token(auth_header) if auth_header else None
        if not token_info or token_info.get('role', '').lower() != 'admin':
            return jsonify({"error": "Forbidden: Admin access required."}), 403

    return jsonify({
        "service": "ShambaPoint Agri-Tech API",
        "version": "3.0",
        "mpesa_env": MPESA_ENV,
        "status": "online",
        "endpoints": {
            "Auth":      ["POST /api/auth/register", "POST /api/auth/login"],
            "Products":  ["GET /api/products", "GET /api/products/<id>"],
            "Orders":    ["GET /api/orders", "POST /api/orders"],
            "Logistics": ["GET /api/logistics", "POST /api/logistics"],
            "M-Pesa STK": [
                "POST /api/payments/mpesa/stkpush",
                "POST /api/payments/mpesa/stkpush/query",
                "POST /api/payments/mpesa/callback  ← Safaricom webhook",
            ],
            "M-Pesa B2C": [
                "POST /api/payments/mpesa/b2c",
                "POST /api/payments/mpesa/b2c/result    ← Safaricom webhook",
                "POST /api/payments/mpesa/b2c/timeout   ← Safaricom webhook",
            ],
            "M-Pesa Utils": [
                "POST /api/payments/mpesa/transaction/status",
                "POST /api/payments/mpesa/balance",
                "GET  /api/payments/mpesa/transactions",
            ],
        }
    })

# ─── AUTH ─────────────────────────────────────────────────────────────────────
@app.route('/api/auth/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    data = request.get_json() or {}
    required = ['name', 'email', 'phone', 'password', 'role']
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 422

    role = data['role'].lower().strip()
    valid_roles = ['farmer', 'buyer', 'logistics', 'admin']
    if role not in valid_roles:
        return jsonify({"error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"}), 422

    # Password strength
    if len(data['password']) < 8:
        return jsonify({"error": "Password must be at least 8 characters."}), 422

    email = data['email'].strip().lower()
    if email in USERS_DB:
        return jsonify({"error": "An account with this email already exists."}), 409

    uid = random.randint(10000, 99999)
    user = {
        "id":            uid,
        "name":          data['name'].strip(),
        "email":         email,
        "phone":         data.get('phone', '').strip(),
        "role":          role,
        "county":        data.get('county', '').strip(),
        "password_hash": hash_password(data['password']),
    }
    USERS_DB[email] = user
    log.info(f"[Auth] New user registered: {email} ({role})")

    public_user = {k: v for k, v in user.items() if k != 'password_hash'}
    return jsonify({
        "message": "Registration successful",
        "user":    public_user,
        "token":   make_token(str(uid), role, user['name'])
    }), 201


@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    data = request.get_json() or {}
    if not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password are required"}), 422

    email = data['email'].strip().lower()
    role  = data.get('role', 'buyer').lower().strip()

    user = USERS_DB.get(email)
    if user:
        # Registered user — verify password hash
        if not check_password(data['password'], user['password_hash']):
            log.warning(f"[Auth] Failed login attempt for {email}")
            return jsonify({"error": "Invalid email or password."}), 401
        # Confirm the role matches what was registered
        if user['role'] != role:
            return jsonify({"error": f"This account is registered as '{user['role']}', not '{role}'."}), 403
        user_id   = str(user['id'])
        user_name = user['name']
        user_role = user['role']
        public_user = {k: v for k, v in user.items() if k != 'password_hash'}
    else:
        log.warning(f"[Auth] Login failed: account not found for {email}")
        return jsonify({"error": "Invalid email or password."}), 401

    role_map = {
        'farmer':    '/farmer/dashboard',
        'buyer':     '/buyer/dashboard',
        'logistics': '/logistics/dashboard',
        'admin':     '/admin/dashboard',
    }
    redirect_url = role_map.get(user_role, '/buyer/dashboard')
    log.info(f"[Auth] Login successful: {email} ({user_role})")
    return jsonify({
        "message":  "Login successful",
        "token":    make_token(user_id, user_role, user_name),
        "user":     public_user,
        "redirect": redirect_url
    })

# ─── PRODUCTS ─────────────────────────────────────────────────────────────────
@app.route('/api/products', methods=['GET'])
def get_products():
    farmer_id = request.args.get('farmer_id')
    if farmer_id:
        # Return only this farmer's products
        mine = FARMER_PRODUCTS.get(str(farmer_id), [])
        return jsonify(mine)
    return jsonify(PRODUCTS)

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    # Check global list and all farmer lists
    product = next((p for p in PRODUCTS if p['id'] == product_id), None)
    if not product:
        for prods in FARMER_PRODUCTS.values():
            product = next((p for p in prods if p['id'] == product_id), None)
            if product:
                break
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product)

@app.route('/api/products', methods=['POST'])
@require_role('farmer', 'admin')
def create_product():
    """Farmer creates a new product listing."""
    data = request.get_json() or {}
    required = ['name', 'price', 'quantity']
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 422

    user = getattr(request, 'current_user', {}) or {}
    farmer_id = str(user.get('user_id', 0))
    farmer_name = user.get('name', 'Farmer')
    product_id = int(time.time() * 1000) % 1000000  # pseudo-unique id
    product = {
        "id":         product_id,
        "farmer_id":  farmer_id,
        "farmer":     farmer_name,
        "name":       data['name'],
        "price":      str(data['price']),
        "quantity":   str(data['quantity']),
        "unit":       data.get('unit', '/kg'),
        "county":     data.get('county', ''),
        "status":     data.get('status', 'Available'),
        "image_url":  data.get('image_url', ''),
        "verified":   False,
        "lowStock":   False,
        "created_at": datetime.utcnow().isoformat() + 'Z',
    }
    if farmer_id not in FARMER_PRODUCTS:
        FARMER_PRODUCTS[farmer_id] = []
    FARMER_PRODUCTS[farmer_id].append(product)
    return jsonify({"message": "Product created", "product": product}), 201

@app.route('/api/products/<int:product_id>', methods=['PUT'])
@require_role('farmer', 'admin')
def update_product(product_id):
    """Farmer edits one of their product listings."""
    data = request.get_json() or {}
    user = getattr(request, 'current_user', {}) or {}
    farmer_id = str(user.get('user_id', 0))
    products = FARMER_PRODUCTS.get(farmer_id, [])
    product = next((p for p in products if p['id'] == product_id), None)
    if not product:
        return jsonify({"error": "Product not found or not owned by you"}), 404

    for field in ('name', 'price', 'quantity', 'unit', 'county', 'status', 'image_url'):
        if field in data:
            product[field] = str(data[field]) if field in ('price', 'quantity') else data[field]
    return jsonify({"message": "Product updated", "product": product})

# ─── ORDERS ───────────────────────────────────────────────────────────────────
@app.route('/api/orders', methods=['GET'])
@require_role('buyer', 'farmer', 'admin')
def get_orders():
    current_user = getattr(request, 'current_user', {})
    user_id = current_user.get('user_id')
    user_role = current_user.get('role', '').lower()

    # Determine orders list
    all_orders = ORDERS if ORDERS else [
        {"order_id": "A1B2C3D4", "buyer_id": "1", "buyer": "John Kamau",   "status": "delivered", "total": 1540, "farmer_id": "2"},
        {"order_id": "E5F6G7H8", "buyer_id": "2", "buyer": "Grace Atieno", "status": "pending",   "total": 860, "farmer_id": "3"},
    ]

    if user_role == 'admin':
        return jsonify(all_orders)
    elif user_role == 'buyer':
        mine = [o for o in all_orders if str(o.get('buyer_id')) == str(user_id)]
        return jsonify(mine)
    elif user_role == 'farmer':
        mine = []
        for o in all_orders:
            if str(o.get('farmer_id')) == str(user_id):
                mine.append(o)
                continue
            items = o.get('items', [])
            if isinstance(items, list):
                for item in items:
                    if isinstance(item, dict) and str(item.get('farmer_id')) == str(user_id):
                        mine.append(o)
                        break
        return jsonify(mine)
    return jsonify([]), 403

@app.route('/api/orders', methods=['POST'])
@require_role('buyer', 'admin')
def create_order():
    data = request.get_json() or {}
    if not data.get('items') or not data.get('buyer_name'):
        return jsonify({"error": "items and buyer_name are required"}), 422

    current_user = getattr(request, 'current_user', {})
    buyer_id = current_user.get('user_id', 'anon')
    order = {
        "order_id":  random_id(),
        "buyer_id":  buyer_id,
        "buyer":     data['buyer_name'],
        "items":     data['items'],
        "status":    "pending",
        "total":     data.get('total', 0),
        "created_at": datetime.utcnow().isoformat() + 'Z',
    }
    ORDERS.append(order)
    if buyer_id not in BUYER_ORDERS:
        BUYER_ORDERS[buyer_id] = []
    BUYER_ORDERS[buyer_id].append(order)
    # Auto-create a pending delivery record for this order
    delivery = {
        "id":              random_id(6),
        "order_id":        order["order_id"],
        "driver_id":       None,
        "status":          "Pending",
        "tracking_details": None,
        "buyer":           data['buyer_name'],
        "items":           data['items'],
        "total":           data.get('total', 0),
        "created_at":      datetime.utcnow().isoformat() + 'Z',
    }
    DELIVERIES.append(delivery)
    return jsonify({"message": "Order placed successfully", **order}), 201

# ─── DELIVERIES ───────────────────────────────────────────────────────────────
@app.route('/api/deliveries', methods=['GET'])
@require_role('logistics', 'admin')
def get_deliveries():
    """List deliveries. Optional filters: driver_id, status."""
    driver_id = request.args.get('driver_id')
    status    = request.args.get('status')

    result = DELIVERIES
    if driver_id:
        result = [d for d in result if str(d.get('driver_id', '')) == str(driver_id)]
    if status:
        result = [d for d in result if d.get('status', '').lower() == status.lower()]

    # Return demo data if empty so the Android app always shows something
    if not result and not driver_id and not status:
        result = [
            {"id": "DLV001", "order_id": "A1B2C3D4", "driver_id": None,
             "status": "Pending",   "buyer": "John Kamau",   "total": 1540,
             "tracking_details": None, "items": "2x Bananas, 1x Tomatoes",
             "created_at": datetime.utcnow().isoformat() + 'Z'},
            {"id": "DLV002", "order_id": "E5F6G7H8", "driver_id": None,
             "status": "In Transit", "buyer": "Grace Atieno", "total": 860,
             "tracking_details": "Picked up from Kiambu", "items": "3x Apples",
             "created_at": datetime.utcnow().isoformat() + 'Z'},
        ]
    return jsonify(result)

@app.route('/api/deliveries/<delivery_id>', methods=['PATCH'])
@require_role('logistics', 'admin')
def update_delivery(delivery_id):
    """Logistics driver updates delivery status or assigns themselves."""
    data = request.get_json() or {}
    delivery = next((d for d in DELIVERIES if d['id'] == delivery_id), None)
    if not delivery:
        return jsonify({"error": "Delivery not found"}), 404

    valid_statuses = {'Pending', 'Picked Up', 'In Transit', 'Delivered'}
    new_status = data.get('status')
    if new_status and new_status not in valid_statuses:
        return jsonify({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}), 422

    if new_status:
        delivery['status'] = new_status
    if 'driver_id' in data:
        delivery['driver_id'] = data['driver_id']
    if 'tracking_details' in data:
        delivery['tracking_details'] = data['tracking_details']

    return jsonify({"message": "Delivery updated", "delivery": delivery})

# ─── LOGISTICS ────────────────────────────────────────────────────────────────
@app.route('/api/logistics', methods=['GET'])
def get_drivers():
    available = [d for d in DRIVERS if d['status'] == 'available']
    return jsonify(available)

@app.route('/api/logistics', methods=['POST'])
def request_logistics():
    data = request.get_json() or {}
    if not data.get('pickup') or not data.get('destination'):
        return jsonify({"error": "pickup and destination are required"}), 422

    available = [d for d in DRIVERS if d['status'] == 'available']
    driver = random.choice(available) if available else DRIVERS[0]

    return jsonify({
        "message":        "Transport allocated successfully",
        "request_id":     random_id(6),
        "driver":         driver,
        "pickup":         data['pickup'],
        "destination":    data['destination'],
        "estimated_cost": 1200,
        "estimated_time": "2-4 hours",
        "status":         "allocated",
    }), 201

# ─── ADMIN USERS ─────────────────────────────────────────────────────────────
@app.route('/api/admin/users', methods=['GET'])
@require_role('admin')
def admin_list_users():
    """
    Return all registered users (from in-memory ADMIN_USERS store).
    In a full DB integration this would SELECT * FROM users.
    """
    all_users = [
        # Seed demo users so the Admin dashboard always shows something
        {"id": 1, "name": "Alice Farmer",    "email": "alice@farm.ke",    "phone": "+254712000001", "role": "Farmer",    "county": "Kiambu",   "status": "active"},
        {"id": 2, "name": "Bob Buyer",       "email": "bob@buy.ke",      "phone": "+254712000002", "role": "Buyer",     "county": "Nairobi",  "status": "active"},
        {"id": 3, "name": "Carol Driver",    "email": "carol@log.ke",    "phone": "+254712000003", "role": "Logistics", "county": "Nakuru",   "status": "active"},
    ] + ADMIN_USERS
    return jsonify({"users": all_users, "total": len(all_users)})

@app.route('/api/admin/users', methods=['POST'])
@require_role('admin')
def admin_create_user():
    """
    Admin creates a new user (including another Admin).
    Body: { name, email, phone, password, role }
    """
    data = request.get_json() or {}
    required = ['name', 'email', 'phone', 'password', 'role']
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 422

    valid_roles = ['Farmer', 'Buyer', 'Logistics', 'Admin']
    if data['role'] not in valid_roles:
        return jsonify({"error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"}), 422

    user = {
        "id":         int(time.time() * 1000) % 1000000,
        "name":       data['name'],
        "email":      data['email'],
        "phone":      data['phone'],
        "role":       data['role'],
        "county":     data.get('county', ''),
        "status":     "active",
        "created_by": getattr(request, 'current_user', {}).get('user_id'),
        "created_at": datetime.utcnow().isoformat() + 'Z',
    }
    ADMIN_USERS.append(user)
    token = make_token(user['id'], data['role'].lower(), data['name'])
    return jsonify({"message": "User created successfully", "user": user, "token": token}), 201

# ─── CART ─────────────────────────────────────────────────────────────────────
@app.route('/api/cart', methods=['POST'])
@require_role('buyer', 'farmer', 'logistics', 'admin')
def add_to_cart():
    data = request.get_json() or {}
    if not data.get('productId'):
        return jsonify({"error": "productId is required"}), 422
    return jsonify({"message": "Item added to cart", "productId": data['productId']})


# ─── FEEDBACK ─────────────────────────────────────────────────────────────────
FEEDBACK_STORE = []  # In-memory; replace with DB in production

@app.route('/api/feedback', methods=['POST'])
@require_role('buyer', 'farmer', 'logistics', 'admin')
def submit_feedback():
    """
    Accept secure transaction feedback from SmartSecurePay.
    Body: { receiptNo, farmer, crop, amount, rating, sentiment, comment, tags, anonymous }
    """
    data = request.get_json() or {}
    if not data.get('receiptNo') or not data.get('rating'):
        return jsonify({"error": "receiptNo and rating are required"}), 422

    # Basic sanitization — strip strings, cap values
    try:
        rating = max(1, min(5, int(data['rating'])))
    except (TypeError, ValueError):
        return jsonify({"error": "rating must be an integer 1–5"}), 422

    record = {
        'id':          random_id(10),
        'receiptNo':   str(data['receiptNo'])[:30],
        'farmer':      str(data.get('farmer', ''))[:100],
        'crop':        str(data.get('crop', ''))[:100],
        'amount':      data.get('amount'),
        'rating':      rating,
        'sentiment':   str(data.get('sentiment', ''))[:20],
        'comment':     str(data.get('comment', ''))[:500],
        'tags':        data.get('tags', [])[:10] if isinstance(data.get('tags'), list) else [],
        'anonymous':   bool(data.get('anonymous', False)),
        'submittedAt': data.get('submittedAt', datetime.utcnow().isoformat() + 'Z'),
        'timestamp':   datetime.utcnow().isoformat() + 'Z',
    }
    FEEDBACK_STORE.append(record)
    log.info(f"[Feedback] Receipt {record['receiptNo']} — rating {rating}/5")
    return jsonify({"message": "Feedback submitted successfully", "id": record['id']}), 201


# ─── HELP CENTER CONTACT & EMAILS ─────────────────────────────────────────────
CONTACT_TICKETS = []

@app.route('/api/help/contact', methods=['POST'])
def submit_contact():
    try:
        data = request.get_json() or {}
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        category = data.get('category', '').strip()
        message = data.get('message', '').strip()

        if not name or not email or not phone or not category or not message:
            return jsonify({
                "success": False,
                "message": "All fields (name, email, phone, category, message) are required.",
                "data": {},
                "error": "MISSING_FIELDS"
            }), 422

        ticket_id = f"TKT-{random_id(6)}"
        submitted_at = datetime.utcnow().isoformat() + 'Z'

        # Map category to specific support department email
        dept_emails = {
            'Farmer Support': 'farmers@shambapoint.co.ke',
            'Buyer Support': 'buyers@shambapoint.co.ke',
            'Logistics Support': 'drivers@shambapoint.co.ke',
            'Admin Support': 'admin@shambapoint.co.ke'
        }
        dept_email = dept_emails.get(category, 'support@shambapoint.co.ke')

        # Simulate sending email notifications
        log.info(f"========== SIMULATED EMAIL DISPATCH (Ticket {ticket_id}) ==========")
        log.info(f"TO: {dept_email}")
        log.info(f"FROM: system-noreply@shambapoint.co.ke")
        log.info(f"SUBJECT: New Support Ticket {ticket_id} - {category}")
        log.info(f"BODY:\n"
                 f"Hello Support Team,\n\n"
                 f"A new support request has been submitted:\n"
                 f"Ticket ID: {ticket_id}\n"
                 f"Name: {name}\n"
                 f"Email: {email}\n"
                 f"Phone: {phone}\n"
                 f"Category: {category}\n\n"
                 f"Message:\n{message}\n"
                 f"==================================================================")

        log.info(f"========== SIMULATED AUTO-REPLY EMAIL (Ticket {ticket_id}) ==========")
        log.info(f"TO: {email}")
        log.info(f"FROM: support@shambapoint.co.ke")
        log.info(f"SUBJECT: Support Ticket {ticket_id} Received")
        log.info(f"BODY:\n"
                 f"Hi {name},\n\n"
                 f"We have received your support request (Ticket ID: {ticket_id}) regarding '{category}'. "
                 f"Our team is reviewing it and will get back to you within 2 hours.\n\n"
                 f"Your Message:\n\"{message}\"\n\n"
                 f"Best regards,\n"
                 f"ShambaPoint Support Team\n"
                 f"==================================================================")

        ticket = {
            "ticketId": ticket_id,
            "name": name,
            "email": email,
            "phone": phone,
            "category": category,
            "message": message,
            "submittedAt": submitted_at
        }
        CONTACT_TICKETS.append(ticket)

        return jsonify({
            "success": True,
            "message": f"Ticket {ticket_id} submitted successfully. An auto-confirmation email has been sent.",
            "data": ticket,
            "error": None
        }), 201

    except Exception as e:
        log.exception("Error creating support ticket")
        return jsonify({
            "success": False,
            "message": "An internal server error occurred while processing your request.",
            "data": {},
            "error": "INTERNAL_SERVER_ERROR"
        }), 500


# ═══════════════════════════════════════════════════════════════════════════════
#  M-PESA DARAJA API
# ═══════════════════════════════════════════════════════════════════════════════

# ─── STK PUSH (Buyer pays — C2B) ──────────────────────────────────────────────
@app.route('/api/payments/mpesa/stkpush', methods=['POST'])
@require_role('buyer', 'admin')
@limiter.limit("10 per minute")
def mpesa_stk_push():
    """
    Initiate Lipa Na M-Pesa Online (STK Push).
    Body: { phone, amount, account_reference, description }
    """
    data = request.get_json() or {}
    phone  = data.get('phone', '').strip()
    amount = data.get('amount')

    if not phone or not amount:
        return jsonify({"error": "phone and amount are required"}), 422

    phone  = fmt_phone(phone)
    amount = str(int(float(amount)))

    # Generate timestamp & password
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password  = generate_stk_password(SHORTCODE, PASSKEY, timestamp)

    # Get OAuth token
    token = get_mpesa_token()
    if not token:
        # Return a simulated response if token fails (e.g., no secret yet)
        checkout_id = f"ws_CO_SIM_{random_id(12)}"
        log_transaction('STK_PUSH_SIMULATED', {
            'phone': phone, 'amount': amount,
            'CheckoutRequestID': checkout_id, 'status': 'simulated'
        })
        return jsonify({
            "MerchantRequestID":  random_id(8),
            "CheckoutRequestID":  checkout_id,
            "ResponseCode":       "0",
            "ResponseDescription":"Success. Request accepted for processing",
            "CustomerMessage":    f"A payment request of KES {amount} has been sent to {phone}. Enter your M-PESA PIN to complete.",
            "_note":              "Simulated — add MPESA_CONSUMER_SECRET to .env for live calls"
        })

    payload = {
        "BusinessShortCode": SHORTCODE,
        "Password":          password,
        "Timestamp":         timestamp,
        "TransactionType":   "CustomerPayBillOnline",
        "Amount":            amount,
        "PartyA":            phone,
        "PartyB":            SHORTCODE,
        "PhoneNumber":       phone,
        "CallBackURL":       CALLBACK_URL,
        "AccountReference":  data.get('account_reference', 'ShambaPoint'),
        "TransactionDesc":   data.get('description', 'ShambaPoint Payment'),
    }

    try:
        resp = requests.post(
            STK_PUSH_URL,
            json=payload,
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type':  'application/json'
            },
            timeout=30
        )
        result = resp.json()
        log.info(f"[STK Push] Response: {result}")

        # Log the transaction
        log_transaction('STK_PUSH', {
            'phone': phone, 'amount': amount,
            'CheckoutRequestID': result.get('CheckoutRequestID'),
            'ResponseCode': result.get('ResponseCode'),
        })

        return jsonify(result), resp.status_code

    except requests.exceptions.Timeout:
        return jsonify({"error": "M-Pesa API timed out. Please try again."}), 504
    except Exception as exc:
        log.error(f"[STK Push] Error: {exc}")
        return jsonify({"error": str(exc)}), 500


# ─── STK PUSH QUERY ───────────────────────────────────────────────────────────
@app.route('/api/payments/mpesa/stkpush/query', methods=['POST'])
@require_role('buyer', 'admin')
def mpesa_stk_query():
    """
    Query status of a previously initiated STK Push.
    Body: { checkout_request_id }
    """
    data = request.get_json() or {}
    checkout_id = data.get('checkout_request_id', '').strip()
    if not checkout_id:
        return jsonify({"error": "checkout_request_id is required"}), 422

    token = get_mpesa_token()
    if not token:
        return jsonify({"error": "Failed to authenticate with M-Pesa"}), 503

    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password  = generate_stk_password(SHORTCODE, PASSKEY, timestamp)

    payload = {
        "BusinessShortCode": SHORTCODE,
        "Password":          password,
        "Timestamp":         timestamp,
        "CheckoutRequestID": checkout_id,
    }

    try:
        resp = requests.post(
            STK_QUERY_URL,
            json=payload,
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type':  'application/json'
            },
            timeout=30
        )
        result = resp.json()
        log.info(f"[STK Query] {checkout_id} → {result}")
        return jsonify(result), resp.status_code
    except Exception as exc:
        log.error(f"[STK Query] Error: {exc}")
        return jsonify({"error": str(exc)}), 500


# ─── STK PUSH CALLBACK (Safaricom → server) ───────────────────────────────────
@app.route('/api/payments/mpesa/callback', methods=['GET', 'POST'])
def mpesa_callback():
    if request.method == 'GET':
        return jsonify({"status": "ready", "message": "M-Pesa STK Push Callback endpoint is online."}), 200
    """
    Safaricom calls this URL after the customer completes (or cancels) payment.
    Log the result and return 200 immediately.
    """
    body = request.get_json(force=True) or {}
    log.info(f"[STK Callback] Received: {json.dumps(body)}")

    try:
        stk_callback = body.get('Body', {}).get('stkCallback', {})
        result_code  = stk_callback.get('ResultCode')
        result_desc  = stk_callback.get('ResultDesc', '')
        checkout_id  = stk_callback.get('CheckoutRequestID', '')
        merchant_id  = stk_callback.get('MerchantRequestID', '')

        # Extract metadata items if payment succeeded
        meta = {}
        if result_code == 0:
            items = stk_callback.get('CallbackMetadata', {}).get('Item', [])
            for item in items:
                meta[item.get('Name')] = item.get('Value')

        record = log_transaction('STK_CALLBACK', {
            'CheckoutRequestID': checkout_id,
            'MerchantRequestID': merchant_id,
            'ResultCode':        result_code,
            'ResultDesc':        result_desc,
            'Amount':            meta.get('Amount'),
            'MpesaReceiptNumber':meta.get('MpesaReceiptNumber'),
            'TransactionDate':   meta.get('TransactionDate'),
            'PhoneNumber':       meta.get('PhoneNumber'),
        })

        if result_code == 0:
            log.info(f"[STK Callback] Payment SUCCESS — Receipt: {meta.get('MpesaReceiptNumber')}, KES {meta.get('Amount')}, Phone: {meta.get('PhoneNumber')}")
        else:
            log.warning(f"[STK Callback] Payment FAILED — {result_desc}")

    except Exception as exc:
        log.error(f"[STK Callback] Parse error: {exc}")

    # Always return 200 to Safaricom
    return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"}), 200


# ─── B2C — Business to Customer (Pay Farmer / Driver) ─────────────────────────
@app.route('/api/payments/mpesa/b2c', methods=['POST'])
def mpesa_b2c():
    """
    Send money from ShambaPoint platform wallet to farmer/driver via M-Pesa B2C.
    Body: { phone, amount, occasion, remarks }
    Use Cases:
      - Release escrow funds to farmer after order completion
      - Pay driver earnings after trip completion
    """
    data = request.get_json() or {}
    phone   = data.get('phone', '').strip()
    amount  = data.get('amount')
    remarks = data.get('remarks', 'ShambaPoint Payout')
    occasion= data.get('occasion', 'Payout')

    if not phone or not amount:
        return jsonify({"error": "phone and amount are required"}), 422

    phone  = fmt_phone(phone)
    amount = str(int(float(amount)))

    token = get_mpesa_token()
    if not token:
        # Simulated for dev
        conv_id = f"AG_{random_id(10)}"
        orig_id = f"SHP_{random_id(8)}"
        log_transaction('B2C_SIMULATED', {
            'phone': phone, 'amount': amount, 'ConversationID': conv_id
        })
        return jsonify({
            "ConversationID":         conv_id,
            "OriginatorConversationID": orig_id,
            "ResponseCode":           "0",
            "ResponseDescription":    "Accept the service request successfully.",
            "_note":                  "Simulated — add MPESA_CONSUMER_SECRET for live"
        })

    payload = {
        "InitiatorName":              B2C_INITIATOR_NAME,
        "SecurityCredential":         B2C_SECURITY_CRED,
        "CommandID":                  "BusinessPayment",
        "Amount":                     amount,
        "PartyA":                     B2C_SHORTCODE,
        "PartyB":                     phone,
        "Remarks":                    remarks,
        "QueueTimeOutURL":            B2C_TIMEOUT_URL,
        "ResultURL":                  B2C_RESULT_URL,
        "Occasion":                   occasion,
    }

    try:
        resp = requests.post(
            B2C_URL,
            json=payload,
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type':  'application/json'
            },
            timeout=30
        )
        result = resp.json()
        log.info(f"[B2C] Response: {result}")

        log_transaction('B2C_INITIATED', {
            'phone': phone, 'amount': amount,
            'ConversationID': result.get('ConversationID'),
            'ResponseCode':   result.get('ResponseCode'),
        })

        return jsonify(result), resp.status_code

    except requests.exceptions.Timeout:
        return jsonify({"error": "M-Pesa B2C API timed out. Please try again."}), 504
    except Exception as exc:
        log.error(f"[B2C] Error: {exc}")
        return jsonify({"error": str(exc)}), 500


# ─── B2C RESULT CALLBACK (Safaricom → server) ─────────────────────────────────
@app.route('/api/payments/mpesa/b2c/result', methods=['GET', 'POST'])
def mpesa_b2c_result():
    if request.method == 'GET':
        return jsonify({"status": "ready", "message": "M-Pesa B2C Result Callback endpoint is online."}), 200
    """Safaricom B2C result callback."""
    body = request.get_json(force=True) or {}
    log.info(f"[B2C Result] {json.dumps(body)}")

    try:
        result      = body.get('Result', {})
        result_code = result.get('ResultCode')
        result_desc = result.get('ResultDesc', '')
        conv_id     = result.get('ConversationID', '')
        orig_id     = result.get('OriginatorConversationID', '')

        # Extract result parameters
        params = {}
        for item in result.get('ResultParameters', {}).get('ResultParameter', []):
            params[item.get('Key')] = item.get('Value')

        log_transaction('B2C_RESULT', {
            'ConversationID':            conv_id,
            'OriginatorConversationID':  orig_id,
            'ResultCode':                result_code,
            'ResultDesc':                result_desc,
            'TransactionAmount':         params.get('TransactionAmount'),
            'TransactionReceipt':        params.get('TransactionReceipt'),
            'ReceiverPartyPublicName':   params.get('ReceiverPartyPublicName'),
            'TransactionCompletedDateTime': params.get('TransactionCompletedDateTime'),
        })

        if result_code == 0:
            log.info(f"[B2C Result] Payout SUCCESS — Receipt: {params.get('TransactionReceipt')}")
        else:
            log.warning(f"[B2C Result] Payout FAILED — {result_desc}")

    except Exception as exc:
        log.error(f"[B2C Result] Parse error: {exc}")

    return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"}), 200


# ─── B2C TIMEOUT CALLBACK ─────────────────────────────────────────────────────
@app.route('/api/payments/mpesa/b2c/timeout', methods=['GET', 'POST'])
def mpesa_b2c_timeout():
    if request.method == 'GET':
        return jsonify({"status": "ready", "message": "M-Pesa B2C Timeout Callback endpoint is online."}), 200
    """Safaricom B2C timeout callback."""
    body = request.get_json(force=True) or {}
    log.warning(f"[B2C Timeout] {json.dumps(body)}")
    log_transaction('B2C_TIMEOUT', body)
    return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"}), 200


# ─── TRANSACTION STATUS ───────────────────────────────────────────────────────
@app.route('/api/payments/mpesa/transaction/status', methods=['POST'])
def mpesa_transaction_status():
    """
    Query status of any M-Pesa transaction by its receipt number.
    Body: { transaction_id, shortcode }
    """
    data = request.get_json() or {}
    txn_id = data.get('transaction_id', '').strip()
    if not txn_id:
        return jsonify({"error": "transaction_id is required"}), 422

    token = get_mpesa_token()
    if not token:
        return jsonify({"error": "M-Pesa authentication failed"}), 503

    shortcode = data.get('shortcode', SHORTCODE)
    payload = {
        "Initiator":                  B2C_INITIATOR_NAME,
        "SecurityCredential":         B2C_SECURITY_CRED,
        "CommandID":                  "TransactionStatusQuery",
        "TransactionID":              txn_id,
        "PartyA":                     shortcode,
        "IdentifierType":             "4",
        "ResultURL":                  B2C_RESULT_URL,
        "QueueTimeOutURL":            B2C_TIMEOUT_URL,
        "Remarks":                    "ShambaPoint status check",
        "Occasion":                   "status",
    }

    try:
        resp = requests.post(
            TXN_STATUS_URL,
            json=payload,
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type':  'application/json'
            },
            timeout=30
        )
        result = resp.json()
        log.info(f"[TXN Status] {txn_id} → {result}")
        return jsonify(result), resp.status_code
    except Exception as exc:
        log.error(f"[TXN Status] Error: {exc}")
        return jsonify({"error": str(exc)}), 500


# ─── ACCOUNT BALANCE ──────────────────────────────────────────────────────────
@app.route('/api/payments/mpesa/balance', methods=['POST'])
def mpesa_balance():
    """Query M-Pesa account balance."""
    token = get_mpesa_token()
    if not token:
        return jsonify({"error": "M-Pesa authentication failed"}), 503

    payload = {
        "Initiator":          B2C_INITIATOR_NAME,
        "SecurityCredential": B2C_SECURITY_CRED,
        "CommandID":          "AccountBalance",
        "PartyA":             B2C_SHORTCODE,
        "IdentifierType":     "4",
        "Remarks":            "Balance check",
        "QueueTimeOutURL":    B2C_TIMEOUT_URL,
        "ResultURL":          B2C_RESULT_URL,
    }

    try:
        resp = requests.post(
            BAL_URL,
            json=payload,
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type':  'application/json'
            },
            timeout=30
        )
        result = resp.json()
        log.info(f"[Balance] {result}")
        return jsonify(result), resp.status_code
    except Exception as exc:
        log.error(f"[Balance] Error: {exc}")
        return jsonify({"error": str(exc)}), 500


# ─── ADMIN: View All Logged Transactions ──────────────────────────────────────
@app.route('/api/payments/mpesa/transactions', methods=['GET'])
@require_role('admin')
def get_transactions():
    """
    Return all logged M-Pesa transactions (STK Push + B2C callbacks).
    Useful for admin dashboard.
    """
    txn_type = request.args.get('type')        # filter by type
    limit    = int(request.args.get('limit', 50))

    results = MPESA_TRANSACTIONS
    if txn_type:
        results = [t for t in results if t.get('type') == txn_type.upper()]

    return jsonify({
        "total":        len(MPESA_TRANSACTIONS),
        "filtered":     len(results),
        "transactions": list(reversed(results))[:limit],   # newest first
    })


# ─── M-Pesa Token Health Check ────────────────────────────────────────────────
@app.route('/api/payments/mpesa/token', methods=['GET'])
@require_role('admin')
def mpesa_token_check():
    """
    Verify M-Pesa credentials are working by fetching a token.
    Returns masked token for security.
    """
    token = get_mpesa_token()
    if token:
        return jsonify({
            "status":      "ok",
            "token_prefix": token[:12] + "...",
            "environment": MPESA_ENV,
            "shortcode":   SHORTCODE,
        })
    return jsonify({
        "status":  "error",
        "message": "Failed to fetch token. Check MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET in .env",
        "environment": MPESA_ENV,
    }), 503


# ─── ERRORS ───────────────────────────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Route not found. Visit /api for available routes."}), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method not allowed on this route."}), 405

@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({"error": f"Rate limit exceeded: {e.description}"}), 429


# ─── FEEDBACK ────────────────────────────────────────────────────────────────
@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    """Accept transaction feedback submissions from SmartSecurePay."""
    data = request.get_json() or {}
    receipt_no = data.get('receiptNo', 'N/A')
    rating     = data.get('rating', 0)
    log.info(f"[Feedback] Receipt={receipt_no} Rating={rating}/5")
    return jsonify({"message": "Feedback received. Thank you!"}), 200


# ─── HELP / CONTACT ──────────────────────────────────────────────────────────
@app.route('/api/help/contact', methods=['POST'])
def help_contact():
    """Accept contact / support ticket submissions from HelpCenter."""
    data    = request.get_json() or {}
    name    = data.get('name', 'Anonymous')
    subject = data.get('subject', '(no subject)')
    log.info(f"[Help] Contact ticket from {name}: {subject}")
    return jsonify({
        "message": "Your message has been received. Our team will respond within 24 hours.",
        "ticketId": f"SP-{random.randint(10000, 99999)}"
    }), 200


# ─── RUN ──────────────────────────────────────────────────────────────────────
def main():
    import sys
    is_dev = '--dev' in sys.argv or os.getenv('FLASK_ENV') == 'development'
    port   = int(os.getenv('PORT', 5000))

    print("\n" + "="*55)
    print("  ShambaPoint Agri-Tech API v3.0")
    print(f"  M-Pesa Environment : {MPESA_ENV.upper()}")
    print(f"  Shortcode          : {SHORTCODE}")
    print(f"  Consumer Key       : {CONSUMER_KEY[:12]}..." if CONSUMER_KEY else "  Consumer Key       : [NOT SET]")
    print(f"  Consumer Secret    : {'[SET]' if CONSUMER_SECRET and CONSUMER_SECRET != 'your_new_secret_here' else '[NOT SET] (required for live)'}")
    print(f"  Callback URL       : {CALLBACK_URL}")
    print(f"  Server URL         : http://0.0.0.0:{port}/api")
    print("="*55 + "\n")

    if is_dev:
        app.run(host='0.0.0.0', port=port, debug=True)
    else:
        try:
            from waitress import serve
            serve(app, host='0.0.0.0', port=port)
        except ImportError:
            app.run(host='0.0.0.0', port=port, debug=False)


if __name__ == '__main__':
    main()
