<?php
// ─── CORS HEADERS ─────────────────────────────────────────────────────────────
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ─── ROUTER SETUP ─────────────────────────────────────────────────────────────
$request = isset($_GET['request']) ? explode('/', trim($_GET['request'], '/')) : [];
$method  = $_SERVER['REQUEST_METHOD'];
$body    = json_decode(file_get_contents('php://input'), true) ?? [];

// Helper function to send a JSON response
function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
if (empty($request) || $request[0] === '') {
    respond([
        "service"  => "ShambaPoint Agri-Tech API",
        "version"  => "2.0",
        "status"   => "online",
        "routes"   => [
            "GET  /api/products"        => "List all products",
            "GET  /api/products/:id"    => "Get single product",
            "POST /api/auth/register"   => "Register a new user",
            "POST /api/auth/login"      => "Login and get JWT token",
            "POST /api/orders"          => "Place an order",
            "GET  /api/orders"          => "List orders",
            "POST /api/logistics"       => "Request logistics / transport",
            "GET  /api/logistics"       => "List logistics requests",
        ]
    ]);
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
if (isset($request[0]) && $request[0] === 'auth') {

    // POST /auth/register
    if (isset($request[1]) && $request[1] === 'register' && $method === 'POST') {
        $required = ['name', 'email', 'phone', 'password', 'role'];
        foreach ($required as $field) {
            if (empty($body[$field])) {
                respond(["error" => "Missing required field: $field"], 422);
            }
        }
        $validRoles = ['farmer', 'buyer', 'logistics', 'admin'];
        if (!in_array($body['role'], $validRoles)) {
            respond(["error" => "Invalid role. Must be one of: " . implode(', ', $validRoles)], 422);
        }
        respond([
            "message" => "Registration successful",
            "user"    => [
                "id"    => rand(1000, 9999),
                "name"  => $body['name'],
                "email" => $body['email'],
                "phone" => $body['phone'],
                "role"  => $body['role'],
            ],
            "token"   => base64_encode($body['email'] . ':' . $body['role'] . ':' . time())
        ], 201);
    }

    // POST /auth/login
    if (isset($request[1]) && $request[1] === 'login' && $method === 'POST') {
        if (empty($body['email']) || empty($body['password'])) {
            respond(["error" => "Email and password are required"], 422);
        }
        $roleMap = [
            'farmer'    => '/farmer/dashboard',
            'buyer'     => '/buyer/dashboard',
            'logistics' => '/logistics/dashboard',
            'admin'     => '/admin/dashboard',
        ];
        $role     = $body['role'] ?? 'buyer';
        $redirect = $roleMap[$role] ?? '/buyer/dashboard';
        respond([
            "message"  => "Login successful",
            "token"    => base64_encode($body['email'] . ':' . $role . ':' . time()),
            "user"     => [
                "id"    => rand(1000, 9999),
                "name"  => explode('@', $body['email'])[0],
                "email" => $body['email'],
                "role"  => $role,
            ],
            "redirect" => $redirect
        ]);
    }

    respond(["error" => "Auth route not found"], 404);
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
$products = [
    ["id" => 1,  "name" => "Fresh Yellow Bananas", "price" => "60",  "unit" => "/kg",    "farmer" => "Njoroge K.", "county" => "Kisii",      "verified" => true,  "lowStock" => false, "image" => "/Agri-Tech.php/images/banana.png"],
    ["id" => 2,  "name" => "Crisp Red Apples",     "price" => "150", "unit" => "/kg",    "farmer" => "Wanjiku F.", "county" => "Meru",       "verified" => true,  "lowStock" => false, "image" => "/Agri-Tech.php/images/apple.png"],
    ["id" => 3,  "name" => "Sweet Ripe Mangoes",   "price" => "120", "unit" => "/kg",    "farmer" => "Mutua J.",   "county" => "Machakos",   "verified" => false, "lowStock" => true,  "image" => "/Agri-Tech.php/images/mango.png"],
    ["id" => 4,  "name" => "Juicy Oranges",         "price" => "80",  "unit" => "/kg",    "farmer" => "Akinyi O.", "county" => "Kisumu",     "verified" => true,  "lowStock" => false, "image" => "/Agri-Tech.php/images/orange.png"],
    ["id" => 5,  "name" => "Irish Potatoes",        "price" => "45",  "unit" => "/kg",    "farmer" => "Mwangi J.", "county" => "Nakuru",     "verified" => true,  "lowStock" => false, "image" => "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80"],
    ["id" => 6,  "name" => "Grade A Tomatoes",      "price" => "80",  "unit" => "/kg",    "farmer" => "Sarah K.",  "county" => "Kiambu",     "verified" => true,  "lowStock" => true,  "image" => "https://images.unsplash.com/photo-1546094096-0df4bcaad337?w=600&q=80"],
    ["id" => 7,  "name" => "Sweet Green Maize",     "price" => "25",  "unit" => "/pc",    "farmer" => "Kibet E.",  "county" => "Uasin Gishu","verified" => true,  "lowStock" => false, "image" => "https://images.unsplash.com/photo-1601592930067-f6bde17c7f29?w=600&q=80"],
    ["id" => 8,  "name" => "Red Onions",            "price" => "120", "unit" => "/kg",    "farmer" => "Agnes L.",  "county" => "Kajiado",    "verified" => true,  "lowStock" => false, "image" => "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80"],
    ["id" => 9,  "name" => "Leafy Spinach",         "price" => "30",  "unit" => "/bunch", "farmer" => "Njoroge T.","county" => "Limuru",     "verified" => false, "lowStock" => false, "image" => "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80"],
    ["id" => 10, "name" => "Sweet Pineapple",       "price" => "150", "unit" => "/pc",    "farmer" => "Maina P.",  "county" => "Thika",      "verified" => true,  "lowStock" => false, "image" => "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&q=80"],
    ["id" => 11, "name" => "Green Cabbage",         "price" => "35",  "unit" => "/head",  "farmer" => "David K.",  "county" => "Nakuru",     "verified" => false, "lowStock" => false, "image" => "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=600&q=80"],
    ["id" => 12, "name" => "Ripe Avocados",         "price" => "15",  "unit" => "/pc",    "farmer" => "Wambui A.", "county" => "Kisumu",     "verified" => true,  "lowStock" => false, "image" => "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&q=80"],
];

if (isset($request[0]) && $request[0] === 'products') {
    // GET /products
    if ($method === 'GET' && !isset($request[1])) {
        respond($products);
    }
    // GET /products/:id
    if ($method === 'GET' && isset($request[1])) {
        $id = (int)$request[1];
        foreach ($products as $p) {
            if ($p['id'] === $id) respond($p);
        }
        respond(["error" => "Product not found"], 404);
    }
    respond(["error" => "Method not allowed"], 405);
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────
if (isset($request[0]) && $request[0] === 'orders') {
    // POST /orders — place a new order
    if ($method === 'POST') {
        if (empty($body['items']) || empty($body['buyer_name'])) {
            respond(["error" => "items and buyer_name are required"], 422);
        }
        respond([
            "message"  => "Order placed successfully",
            "order_id" => strtoupper(substr(md5(time()), 0, 8)),
            "status"   => "pending",
            "items"    => $body['items'],
            "buyer"    => $body['buyer_name'],
        ], 201);
    }
    // GET /orders
    if ($method === 'GET') {
        respond([
            ["order_id" => "A1B2C3D4", "buyer" => "John Kamau",  "status" => "delivered", "total" => 1540],
            ["order_id" => "E5F6G7H8", "buyer" => "Grace Atieno","status" => "pending",   "total" => 860],
        ]);
    }
}

// ─── LOGISTICS ────────────────────────────────────────────────────────────────
if (isset($request[0]) && $request[0] === 'logistics') {
    $drivers = [
        ["id" => 1, "name" => "David Ochieng",  "vehicle" => "KCA 123Z (Isuzu FRR)",  "status" => "available", "rate_per_km" => 85],
        ["id" => 2, "name" => "Peter Waweru",   "vehicle" => "KBX 456Y (Mitsubishi)", "status" => "available", "rate_per_km" => 90],
        ["id" => 3, "name" => "James Kimani",   "vehicle" => "KDA 789W (Toyota Dyna)","status" => "on_trip",   "rate_per_km" => 80],
    ];

    // POST /logistics — request transport
    if ($method === 'POST') {
        if (empty($body['pickup']) || empty($body['destination'])) {
            respond(["error" => "pickup and destination are required"], 422);
        }
        $driver = $drivers[array_rand($drivers)];
        respond([
            "message"          => "Transport allocated successfully",
            "request_id"       => strtoupper(substr(md5(time()), 0, 6)),
            "driver"           => $driver,
            "pickup"           => $body['pickup'],
            "destination"      => $body['destination'],
            "estimated_cost"   => 1200,
            "estimated_time"   => "2-4 hours",
            "status"           => "allocated",
        ], 201);
    }
    // GET /logistics — list available drivers
    if ($method === 'GET') {
        respond(array_filter($drivers, fn($d) => $d['status'] === 'available'));
    }
}

// ─── CART ─────────────────────────────────────────────────────────────────────
if (isset($request[0]) && $request[0] === 'cart' && $method === 'POST') {
    if (empty($body['productId'])) {
        respond(["error" => "productId is required"], 422);
    }
    respond(["message" => "Item added to cart", "productId" => $body['productId']]);
}

// ─── 404 ──────────────────────────────────────────────────────────────────────
respond(["error" => "Route not found. Visit /Agri-Tech.php/api to see all available routes."], 404);
?>
