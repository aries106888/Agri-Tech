# 🌿 ShambaPoint Agri-Tech Platform

A full-stack agricultural marketplace connecting Kenyan farmers, buyers, and logistics providers.

## Stack
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Python Flask REST API

---

## 🚀 Running Locally

### 1. Start the Flask Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```
The API will be available at: **http://localhost:5000/api**

### 2. Start the React Frontend
In a new terminal:
```bash
npm install
npm run dev
```
The website will be available at: **http://localhost:5174**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api` | API status and route list |
| GET | `/api/products` | List all products |
| GET | `/api/products/<id>` | Get single product |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive token |
| GET | `/api/orders` | List all orders |
| POST | `/api/orders` | Place a new order |
| GET | `/api/logistics` | List available drivers |
| POST | `/api/logistics` | Request transport allocation |

---

## 🗂 Project Structure
```
├── backend/             # Flask Python Backend
│   ├── app.py           # Main Flask application
│   ├── requirements.txt # Python dependencies
│   ├── start_backend.bat # Windows quick-start script
│   └── static/images/   # Fruit images served by Flask
├── src/                 # React Frontend Source
│   ├── pages/           # Page components
│   ├── layouts/         # Dashboard layouts
│   └── services/api.js  # Axios API client
├── public/              # Static assets
└── vite.config.js       # Vite build config + Flask proxy
```

---

## 👤 User Roles
| Role | Dashboard |
|------|-----------|
| Farmer | `/farmer/dashboard` |
| Buyer | `/buyer/dashboard` |
| Logistics | `/logistics/dashboard` |
| Admin | `/admin/dashboard` |
