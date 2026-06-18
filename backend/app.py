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
import json
import base64
import random
import string
import time
import logging
from datetime import datetime

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

# ─── LOAD ENV ─────────────────────────────────────────────────────────────────
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
log = logging.getLogger(__name__)

# ─── CONFIG ───────────────────────────────────────────────────────────────────
MPESA_ENV            = os.getenv('MPESA_ENV', 'sandbox')
CONSUMER_KEY         = os.getenv('MPESA_CONSUMER_KEY', '')
CONSUMER_SECRET      = os.getenv('MPESA_CONSUMER_SECRET', '')
SHORTCODE            = os.getenv('MPESA_SHORTCODE', '174379')
PASSKEY              = os.getenv('MPESA_PASSKEY', '')
CALLBACK_URL         = os.getenv('MPESA_CALLBACK_URL', 'https://yourdomain.com/api/mpesa/callback')

B2C_SHORTCODE        = os.getenv('MPESA_B2C_SHORTCODE', '600000')
B2C_INITIATOR_NAME   = os.getenv('MPESA_B2C_INITIATOR_NAME', 'testapi')
B2C_SECURITY_CRED    = os.getenv('MPESA_B2C_SECURITY_CREDENTIAL', '')
B2C_RESULT_URL       = os.getenv('MPESA_B2C_RESULT_URL', 'https://yourdomain.com/api/mpesa/b2c/result')
B2C_TIMEOUT_URL      = os.getenv('MPESA_B2C_TIMEOUT_URL', 'https://yourdomain.com/api/mpesa/b2c/timeout')

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

# ─── HELPERS ──────────────────────────────────────────────────────────────────
def random_id(length=8):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def make_token(email, role):
    raw = f"{email}:{role}:{int(time.time())}"
    return base64.b64encode(raw.encode()).decode()

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
    {"id": 1,  "name": "Fresh Yellow Bananas", "price": "60",  "unit": "/kg",    "farmer": "Njoroge K.", "county": "Kisii",       "verified": True,  "lowStock": False},
    {"id": 2,  "name": "Crisp Red Apples",     "price": "150", "unit": "/kg",    "farmer": "Wanjiku F.", "county": "Meru",        "verified": True,  "lowStock": False},
    {"id": 3,  "name": "Sweet Ripe Mangoes",   "price": "120", "unit": "/kg",    "farmer": "Mutua J.",   "county": "Machakos",    "verified": False, "lowStock": True },
    {"id": 4,  "name": "Juicy Oranges",        "price": "80",  "unit": "/kg",    "farmer": "Akinyi O.",  "county": "Kisumu",      "verified": True,  "lowStock": False},
    {"id": 5,  "name": "Irish Potatoes",       "price": "45",  "unit": "/kg",    "farmer": "Mwangi J.",  "county": "Nakuru",      "verified": True,  "lowStock": False},
    {"id": 6,  "name": "Grade A Tomatoes",     "price": "80",  "unit": "/kg",    "farmer": "Sarah K.",   "county": "Kiambu",      "verified": True,  "lowStock": True },
    {"id": 7,  "name": "Sweet Green Maize",    "price": "25",  "unit": "/pc",    "farmer": "Kibet E.",   "county": "Uasin Gishu", "verified": True,  "lowStock": False},
    {"id": 8,  "name": "Sweet Watermelon",     "price": "120", "unit": "/pc",    "farmer": "Agnes L.",   "county": "Kajiado",     "verified": True,  "lowStock": False},
    {"id": 9,  "name": "Leafy Spinach",        "price": "10",  "unit": "/bunch", "farmer": "Njoroge T.", "county": "Limuru",      "verified": False, "lowStock": False},
    {"id": 10, "name": "Sweet Pineapple",      "price": "150", "unit": "/pc",    "farmer": "Maina P.",   "county": "Thika",       "verified": True,  "lowStock": False},
    {"id": 11, "name": "Organic Tomatoes",     "price": "35",  "unit": "/kg",    "farmer": "David K.",   "county": "Nakuru",      "verified": False, "lowStock": False},
    {"id": 12, "name": "Ripe Avocados",        "price": "30",  "unit": "/pc",    "farmer": "Wambui A.",  "county": "Kisumu",      "verified": True,  "lowStock": False},
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
    from flask import redirect
    return redirect('/api')

@app.route('/api', methods=['GET'])
def index():
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
def register():
    data = request.get_json() or {}
    required = ['name', 'email', 'phone', 'password', 'role']
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 422

    valid_roles = ['farmer', 'buyer', 'logistics', 'admin']
    if data['role'] not in valid_roles:
        return jsonify({"error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"}), 422

    return jsonify({
        "message": "Registration successful",
        "user": {
            "id":    random.randint(1000, 9999),
            "name":  data['name'],
            "email": data['email'],
            "phone": data['phone'],
            "role":  data['role'],
        },
        "token": make_token(data['email'], data['role'])
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    if not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password are required"}), 422

    role_map = {
        'farmer':    '/farmer/dashboard',
        'buyer':     '/buyer/dashboard',
        'logistics': '/logistics/dashboard',
        'admin':     '/admin/dashboard',
    }
    role     = data.get('role', 'buyer')
    redirect = role_map.get(role, '/buyer/dashboard')

    return jsonify({
        "message":  "Login successful",
        "token":    make_token(data['email'], role),
        "user": {
            "id":    random.randint(1000, 9999),
            "name":  data['email'].split('@')[0].title(),
            "email": data['email'],
            "role":  role,
        },
        "redirect": redirect
    })

# ─── PRODUCTS ─────────────────────────────────────────────────────────────────
@app.route('/api/products', methods=['GET'])
def get_products():
    return jsonify(PRODUCTS)

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = next((p for p in PRODUCTS if p['id'] == product_id), None)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product)

# ─── ORDERS ───────────────────────────────────────────────────────────────────
@app.route('/api/orders', methods=['GET'])
def get_orders():
    return jsonify(ORDERS if ORDERS else [
        {"order_id": "A1B2C3D4", "buyer": "John Kamau",   "status": "delivered", "total": 1540},
        {"order_id": "E5F6G7H8", "buyer": "Grace Atieno", "status": "pending",   "total": 860},
    ])

@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.get_json() or {}
    if not data.get('items') or not data.get('buyer_name'):
        return jsonify({"error": "items and buyer_name are required"}), 422

    order = {
        "order_id": random_id(),
        "buyer":    data['buyer_name'],
        "items":    data['items'],
        "status":   "pending",
        "total":    data.get('total', 0),
    }
    ORDERS.append(order)
    return jsonify({"message": "Order placed successfully", **order}), 201

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

# ─── CART ─────────────────────────────────────────────────────────────────────
@app.route('/api/cart', methods=['POST'])
def add_to_cart():
    data = request.get_json() or {}
    if not data.get('productId'):
        return jsonify({"error": "productId is required"}), 422
    return jsonify({"message": "Item added to cart", "productId": data['productId']})


# ═══════════════════════════════════════════════════════════════════════════════
#  M-PESA DARAJA API
# ═══════════════════════════════════════════════════════════════════════════════

# ─── STK PUSH (Buyer pays — C2B) ──────────────────────────────────────────────
@app.route('/api/payments/mpesa/stkpush', methods=['POST'])
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
@app.route('/api/payments/mpesa/callback', methods=['POST'])
def mpesa_callback():
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
            log.info(f"[STK Callback] ✅ Payment SUCCESS — Receipt: {meta.get('MpesaReceiptNumber')}, KES {meta.get('Amount')}, Phone: {meta.get('PhoneNumber')}")
        else:
            log.warning(f"[STK Callback] ❌ Payment FAILED — {result_desc}")

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
@app.route('/api/payments/mpesa/b2c/result', methods=['POST'])
def mpesa_b2c_result():
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
            log.info(f"[B2C Result] ✅ Payout SUCCESS — Receipt: {params.get('TransactionReceipt')}")
        else:
            log.warning(f"[B2C Result] ❌ Payout FAILED — {result_desc}")

    except Exception as exc:
        log.error(f"[B2C Result] Parse error: {exc}")

    return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"}), 200


# ─── B2C TIMEOUT CALLBACK ─────────────────────────────────────────────────────
@app.route('/api/payments/mpesa/b2c/timeout', methods=['POST'])
def mpesa_b2c_timeout():
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


# ─── RUN ──────────────────────────────────────────────────────────────────────
def main():
    import sys
    is_dev = '--dev' in sys.argv or os.getenv('FLASK_ENV') == 'development'

    print("\n" + "="*55)
    print("  ShambaPoint Agri-Tech API v3.0")
    print(f"  M-Pesa Environment : {MPESA_ENV.upper()}")
    print(f"  Shortcode          : {SHORTCODE}")
    print(f"  Consumer Key       : {CONSUMER_KEY[:12]}..." if CONSUMER_KEY else "  Consumer Key       : [NOT SET]")
    print(f"  Consumer Secret    : {'[SET]' if CONSUMER_SECRET and CONSUMER_SECRET != 'your_new_secret_here' else '[NOT SET] (required for live)'}")
    print(f"  Callback URL       : {CALLBACK_URL}")
    print(f"  Server URL         : http://localhost:5000/api")
    print("="*55 + "\n")

    if is_dev:
        app.run(host='0.0.0.0', port=5000, debug=True)
    else:
        try:
            from waitress import serve
            serve(app, host='0.0.0.0', port=5000)
        except ImportError:
            app.run(host='0.0.0.0', port=5000, debug=False)


if __name__ == '__main__':
    main()
