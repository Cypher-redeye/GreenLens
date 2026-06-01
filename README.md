# 🌿 GreenLens - Enterprise B2B Sustainability Platform
![React](https://img.shields.io/badge/Frontend-React-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Gemini AI](https://img.shields.io/badge/AI-Gemini-orange)
![PWA](https://img.shields.io/badge/App-Progressive_Web_App-purple)
![License](https://img.shields.io/badge/Status-Production_Ready-success) 

**Smart & Digital Innovation | Sustainability Hackathon 2026**

> _Track your carbon. Transform your organization._

GreenLens is a production-grade, multi-tenant B2B SaaS platform that empowers modern enterprises, campuses, and organizations to track, manage, and reduce their collective carbon footprint using AI. 

### 🌐 Live Production Application
* **Frontend (Vercel):** [https://green-lens-tau.vercel.app](https://green-lens-tau.vercel.app/)
* **Backend (Render):** [https://greenlens-backend-n3ws.onrender.com](https://greenlens-backend-n3ws.onrender.com/)

---

## 🚀 Key Enterprise Features

### 🏢 B2B Multi-Tenancy Architecture
- True multi-tenant data isolation using a core `Organization` structure.
- **Role-Based Access Control (RBAC):** Users are assigned either `admin` or `employee` roles.
- **Corporate Admin Dashboard:** A dedicated, protected route for administrators to view aggregated company-wide CO₂ savings.

### 🛡️ Enterprise-Grade Security & Fraud Prevention
- **pHash (Perceptual Hashing) Fraud Detection:** Implemented `ImageHash` with a 30-day sliding window to prevent users from uploading visually similar receipts to cheat the leaderboard.
- **DDoS & Cost Protection:** Strict API rate-limiting via `slowapi` on expensive LLM routes (5 req/min) to prevent abuse of the Gemini Vision API.
- **OOM Protection:** Hard limits on UploadFile sizes (Max 5MB) to prevent memory exhaustion attacks.
- **Secure Auth:** JWT-based authentication with bcrypt password hashing and enforced strong password policies.

### 📱 Progressive Web App (PWA)
- Full PWA support allowing employees to install GreenLens directly to their iOS or Android home screen for a seamless, native-app-like receipt scanning experience.

### 📊 Compliance & Reporting
- **1-Click CSV Export:** Administrators can instantly download a formatted CSV report of their entire organization's carbon offset activities for sustainability compliance and CSR reporting.
- **Dynamic Data Visualization:** High-performance charting using `Recharts` to visualize offset trends over time.

### 🤖 Gemini AI Integration
- **Vision Scanning:** Uses Google Gemini 1.5 Flash to automatically extract carbon footprint data from photos of food or transport receipts.
- **AI Coach:** Generates contextual, personalized nudges encouraging employees to make greener choices.

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
| ---------- | ------- |
| **FastAPI** | High-performance async web framework |
| **SQLAlchemy** | ORM for database interactions |
| **PostgreSQL** | Relational Database (Neon) |
| **SlowAPI** | Endpoint rate limiting |
| **ImageHash** | Perceptual hashing for fraud detection |
| **Alembic** | Database migrations |

### Frontend
| Technology | Purpose |
| ---------- | ------- |
| **React + Vite** | Lightning-fast UI framework |
| **Tailwind CSS** | Utility-first styling |
| **Recharts** | Corporate dashboard data visualization |
| **Vite PWA** | Progressive Web App integration |
| **Axios** | Secure API communication |

---

## 📂 Project Structure

```
GreenLens/
├── backend/                      
│   ├── main.py                  # Core API, Auth, Rate Limiting & Admin Routes
│   ├── models.py                # Organizations, Users, Activities, Stats
│   ├── vision.py                # pHash Fraud Detection + Gemini API
│   ├── alembic/                 # DB Migrations for Multi-Tenancy
│   └── requirements.txt          
│
├── frontend/                     
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AdminDashboardPage.jsx # Protected corporate analytics
│   │   │   ├── DashboardPage.jsx      # Employee personal view
│   │   │   └── AuthPages.jsx          # Org creation & signup flow
│   │   └── api.js               # Centralized Axios interceptors
│   ├── vite.config.js           # PWA configuration
│   └── package.json             
```

---

## ⚡ Local Setup

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd GreenLens
```

**2. Backend Setup**
```bash
cd backend
pip install -r requirements.txt
# Add .env with DATABASE_URL, SECRET_KEY, GEMINI_API_KEY
alembic upgrade head # Run migrations
python main.py
```

**3. Frontend Setup**
```bash
cd frontend
npm install
# Add .env.local with VITE_API_URL=http://localhost:8000
npm run dev
```

---

## 🤝 Team
**GreenLens Development Team**
- Smart & Digital Innovation Category
- Building scalable SaaS for a sustainable future.

---
*Built for the Parul University Sustainability Hackathon 2026*
