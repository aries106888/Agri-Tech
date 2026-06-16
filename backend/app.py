from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import string
import time
import base64

app = Flask(__name__)
CORS(app)  # Allow React frontend on port 5174 to call this API

# ─── HELPERS ──────────────────────────────────────────────────────────────────
def random_id(length=8):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def make_token(email, role):
    raw = f"{email}:{role}:{int(time.time())}"
    return base64.b64encode(raw.encode()).decode()

# ─── IN-MEMORY DATA ───────────────────────────────────────────────────────────
PRODUCTS = [
    {"id": 1,  "name": "Fresh Yellow Bananas", "price": "60",  "unit": "/kg",    "farmer": "Njoroge K.", "county": "Kisii",       "verified": True,  "lowStock": False, "image": "http://localhost:5000/static/images/banana.png"},
    {"id": 2,  "name": "Crisp Red Apples",     "price": "150", "unit": "/kg",    "farmer": "Wanjiku F.", "county": "Meru",        "verified": True,  "lowStock": False, "image": "http://localhost:5000/static/images/apple.png"},
    {"id": 3,  "name": "Sweet Ripe Mangoes",   "price": "120", "unit": "/kg",    "farmer": "Mutua J.",   "county": "Machakos",    "verified": False, "lowStock": True,  "image": "http://localhost:5000/static/images/mango.png"},
    {"id": 4,  "name": "Juicy Oranges",        "price": "80",  "unit": "/kg",    "farmer": "Akinyi O.",  "county": "Kisumu",      "verified": True,  "lowStock": False, "image": "http://localhost:5000/static/images/orange.png"},
    {"id": 5,  "name": "Irish Potatoes",       "price": "45",  "unit": "/kg",    "farmer": "Mwangi J.",  "county": "Nakuru",      "verified": True,  "lowStock": False, "image": "http://localhost:5000/static/images/potatoes.png"},
    {"id": 6,  "name": "Grade A Tomatoes",     "price": "80",  "unit": "/kg",    "farmer": "Sarah K.",   "county": "Kiambu",      "verified": True,  "lowStock": True,  "image": "http://localhost:5000/static/images/tomatoes.png"},
    {"id": 7,  "name": "Sweet Green Maize",    "price": "25",  "unit": "/pc",    "farmer": "Kibet E.",   "county": "Uasin Gishu", "verified": True,  "lowStock": False, "image": "http://localhost:5000/static/images/maize.png"},
    {"id": 8,  "name": "Sweet Watermelon",     "price": "120", "unit": "/pc",    "farmer": "Agnes L.",   "county": "Kajiado",     "verified": True,  "lowStock": False, "image": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80"},
    {"id": 9,  "name": "Leafy Spinach",        "price": "10",  "unit": "/bunch", "farmer": "Njoroge T.", "county": "Limuru",      "verified": False, "lowStock": False, "image": "http://localhost:5000/static/images/spinach.png"},
    {"id": 10, "name": "Sweet Pineapple",      "price": "150", "unit": "/pc",    "farmer": "Maina P.",   "county": "Thika",       "verified": True,  "lowStock": False, "image": "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&q=80"},
    {"id": 11, "name": "Organic Tomatoes",     "price": "35",  "unit": "/kg",    "farmer": "David K.",   "county": "Nakuru",      "verified": False, "lowStock": False, "image": "http://localhost:5000/static/images/tomatoes.png"},
    {"id": 12, "name": "Ripe Avocados",        "price": "30",  "unit": "/pc",    "farmer": "Wambui A.",  "county": "Kisumu",      "verified": True,  "lowStock": False, "image": "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&q=80"},
]

DRIVERS = [
    {"id": 1, "name": "David Ochieng", "vehicle": "KCA 123Z (Isuzu FRR)",   "status": "available", "rate_per_km": 85},
    {"id": 2, "name": "Peter Waweru",  "vehicle": "KBX 456Y (Mitsubishi)",  "status": "available", "rate_per_km": 90},
    {"id": 3, "name": "James Kimani",  "vehicle": "KDA 789W (Toyota Dyna)", "status": "on_trip",   "rate_per_km": 80},
]

ORDERS = []  # In-memory order store (resets on server restart)

# ─── ROOT ─────────────────────────────────────────────────────────────────────
@app.route('/', methods=['GET'])
def home():
    from flask import redirect
    return redirect('/api')

@app.route('/api', methods=['GET'])
def index():
    return jsonify({
        "service": "ShambaPoint Agri-Tech Flask API",
        "version": "2.0",
        "status": "online",
        "routes": {
            "GET  /api/products":        "List all products",
            "GET  /api/products/{id}":   "Get single product",
            "POST /api/auth/register":   "Register a new user",
            "POST /api/auth/login":      "Login and get token",
            "GET  /api/orders":          "List orders",
            "POST /api/orders":          "Place a new order",
            "GET  /api/logistics":       "List available drivers",
            "POST /api/logistics":       "Request transport allocation",
            "POST /api/cart":            "Add item to cart",
            "POST /api/payments/mpesa/stkpush": "Initiate M-Pesa payment"
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

# ─── PAYMENTS ─────────────────────────────────────────────────────────────────
@app.route('/api/payments/mpesa/stkpush', methods=['POST'])
def mpesa_stkpush():
    data = request.get_json() or {}
    if not data.get('phone') or not data.get('amount'):
        return jsonify({"error": "phone and amount are required"}), 422
    
    return jsonify({
        "message": "STK Push initiated successfully",
        "CheckoutRequestID": f"ws_CO_{random_id(12)}",
        "MerchantRequestID": random_id(8),
        "ResponseCode": "0",
        "ResponseDescription": "Success. Request accepted for processing",
        "CustomerMessage": f"Payment request of KES {data.get('amount')} sent to {data.get('phone')}"
    })

# ─── 404 ──────────────────────────────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Route not found. Visit /api for available routes."}), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method not allowed on this route."}), 405

# ─── RUN ──────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print("\n ShambaPoint Flask API")
    print("   Running at: http://localhost:5000/api")
    print("   Press CTRL+C to stop\n")
    app.run(host='0.0.0.0', port=5000, debug=True)
