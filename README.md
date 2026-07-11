# 🌿 ShambaPoint Agri-Tech Platform

A full-stack agricultural marketplace connecting Kenyan farmers, buyers, and logistics providers.

## Stack
- **Frontend**: React 18 + Vite + TailwindCSS (port 5174 in dev)
- **Backend**: Python Flask REST API with HMAC-SHA256 JWT auth (port 5000)
- **Database**: MySQL 8.0 (via PyMySQL) — falls back to in-memory store in dev if DB is unavailable

---

## 🚀 Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8.0 (optional — in-memory demo mode works without it)

### 1. Install Python dependencies (one time)

```powershell
# Create the virtual environment (project root)
python -m venv .venv

# Activate it
.\.venv\Scripts\Activate.ps1

# Install backend packages
pip install -r backend/requirements.txt
```

### 2. Start the Flask Backend

**Option A — using npm script (recommended):**
```powershell
npm run dev:backend
```

**Option B — directly:**
```powershell
.\.venv\Scripts\python.exe backend\app.py --dev
```

The API will be available at: **http://localhost:5000/api**

### 3. Start the React Frontend (new terminal)

```powershell
npm install    # first time only
npm run dev
```

The website will be available at: **http://localhost:5174**

> **Proxy**: All `/api/*` requests from the frontend are proxied by Vite to `http://localhost:5000`. Never hardcode the Flask URL in the frontend — always use `/api`.

---

## 🗄️ Database Setup (MySQL)

If MySQL is running, create the database and user:

```powershell
# Connect as root
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p

# Then run:
SOURCE C:/Xampp/htdocs/Agri-Tech.php/database.sql;
```

Configure credentials in `backend/.env`:
```env
DB_HOST=127.0.0.1
DB_USER=shambapoint_app
DB_PASSWORD=shamba_secure_pass_123!
DB_NAME=shambapoint
```

> **Without MySQL**: The backend auto-falls back to an in-memory user store. Logins still work in demo mode — any email/password combination succeeds and sessions are JWT-based.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api` | API status and route list |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT token |
| GET | `/api/products` | List all products |
| GET | `/api/products/<id>` | Get single product |
| POST | `/api/products` | Create product (farmer/admin) |
| GET | `/api/orders` | List orders |
| POST | `/api/orders` | Place a new order |
| GET | `/api/logistics` | List available drivers |
| POST | `/api/logistics` | Request transport |
| POST | `/api/payments/mpesa/stkpush` | M-Pesa STK Push |
| POST | `/api/payments/mpesa/callback` | M-Pesa callback webhook |

---

## 🗂 Project Structure

```
├── backend/
│   ├── app.py              # Flask REST API (auth, products, orders, M-Pesa)
│   ├── .env                # Backend secrets (JWT_SECRET, DB creds, M-Pesa keys)
│   ├── requirements.txt    # Python dependencies
│   └── static/images/      # Product images served by Flask
├── src/
│   ├── contexts/AuthContext.jsx   # JWT auth state management
│   ├── services/api.js            # Axios instance (baseURL = /api)
│   ├── pages/                     # All page components by role
│   ├── layouts/                   # Dashboard & TopNav layouts
│   └── routes/ProtectedRoute.jsx  # Role-based route guard
├── database.sql            # MySQL schema + user creation
├── vite.config.js          # Vite + proxy config (/api → localhost:5000)
└── package.json
```

---

## 👤 User Roles

| Role | Login URL | Dashboard |
|------|-----------|-----------|
| Farmer | `/login` (select Farmer) or `/farmer/login` | `/farmer/dashboard` |
| Buyer | `/login` (select Buyer) | `/buyer/dashboard` |
| Logistics | `/login` (select Logistics) | `/logistics/dashboard` |
| Admin | `/admin/login` | `/admin/dashboard` |

---

## 🔐 Auth System

- JWT tokens are HMAC-SHA256 signed (no PyJWT dependency required)
- Token is stored in `localStorage` as `spToken`
- User profile is cached as `spUser` (JSON)
- All protected API routes require `Authorization: Bearer <token>` header
- Token expiry: 7 days
