# GreenLens - Full Stack Deployment Guide

**Complete AI-powered carbon tracking platform for Indian college students**

---

## 📋 PROJECT STRUCTURE

```
GreenLens/
├── backend/                  # FastAPI Python backend
│   ├── main.py              # Main application
│   ├── models.py            # SQLAlchemy ORM
│   ├── schemas.py           # Pydantic validation
│   ├── auth.py              # JWT + bcrypt auth
│   ├── emission_factors.py  # CO2 calculation
│   ├── gemini_nudges.py     # AI nudge generation
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile           # Container config
│   └── .env.example         # Environment template
│
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx          # Main app component
│   │   ├── AuthContext.jsx  # Auth state management
│   │   ├── api.js           # API client
│   │   ├── pages/           # 6 main pages
│   │   └── components/      # Reusable components
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml        # Local development setup
└── README.md
```

---

## 🚀 LOCAL DEVELOPMENT (5 mins)

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ (or Docker)

### Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Copy env file
copy .env.example .env

# Edit .env - set your Gemini API key (optional)
# DATABASE_URL=postgresql://user:password@localhost:5432/greenlens
# SECRET_KEY=your-random-secret-key
# GEMINI_API_KEY=sk-xxxxx (optional)
```

### Start PostgreSQL

**Option A: Docker (Recommended)**

```bash
cd ..
docker-compose up -d postgres
# Wait 5 seconds
```

**Option B: Manual PostgreSQL**

```bash
# Windows: Download from https://www.postgresql.org/download/windows/
# macOS: brew install postgresql@15 && brew services start postgresql@15
# Linux: sudo apt install postgresql && sudo service postgresql start

# Create database
psql -U postgres
CREATE DATABASE greenlens;
\q
```

### Run Backend

```bash
cd backend
python main.py

# Or with auto-reload:
# pip install uvicorn[standard]
# uvicorn main:app --reload
```

✅ Backend running at: **http://localhost:8000**
📖 Docs at: **http://localhost:8000/docs**

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy env
copy .env.example .env

# Start dev server
npm run dev
```

✅ Frontend running at: **http://localhost:3000**

---

## ⚙️ ENVIRONMENT SETUP

### Backend .env

```
DATABASE_URL=postgresql://user:password@localhost:5432/greenlens
SECRET_KEY=your-super-secret-key-min-32-chars
GEMINI_API_KEY=sk-your-gemini-api-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=development
```

### Frontend .env

```
VITE_API_URL=http://localhost:8000
```

---

## 🌐 PRODUCTION DEPLOYMENT

### Option 1: Railway (RECOMMENDED - Easiest)

**Step 1: Create Railway Account**

- Go to https://railway.app
- Sign up with GitHub

**Step 2: Create PostgreSQL Database**

- Dashboard → New Project
- Add Plugin → PostgreSQL
- Copy internal database URL

**Step 3: Deploy Backend**

- New Service → Connect GitHub Repo
- Select `GreenLens` repository
- Set Build Command:
  ```
  pip install -r backend/requirements.txt
  ```
- Set Start Command:
  ```
  cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
  ```
- Add Environment Variables:
  ```
  DATABASE_URL=<from PostgreSQL plugin>
  SECRET_KEY=<generate random 32+ char string>
  GEMINI_API_KEY=<your API key>
  ENVIRONMENT=production
  ```
- Deploy → Get public URL

**Step 4: Deploy Frontend**

- New Service → Connect GitHub Repo
- Select `GreenLens` repository
- Set Build Command:
  ```
  cd frontend && npm run build
  ```
- Set Start Command:
  ```
  npm run preview
  ```
- Add Environment Variable:
  ```
  VITE_API_URL=https://your-backend.railway.app
  ```
- Deploy → Get public URL

---

### Option 2: Render (Free Tier Available)

**Backend Deployment:**

1. Go to https://render.com
2. New → Web Service → Connect GitHub
3. Build Command: `pip install -r backend/requirements.txt`
4. Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Create PostgreSQL from Dashboard
6. Add env vars → Deploy

**Frontend Deployment:**

1. New Static Site → Connect GitHub
2. Build Command: `cd frontend && npm run build`
3. Publish Directory: `frontend/dist`
4. Deploy

---

### Option 3: Docker + VPS (AWS/DigitalOcean/Linode)

**Build Images:**

```bash
# Backend
docker build -t greenlens-backend ./backend

# Frontend
docker build -t greenlens-frontend ./frontend
```

**Run with Docker Compose:**

```bash
docker-compose up -d
```

**Manage with PM2 (persistent):**

```bash
pm2 start docker-compose.yml --name greenlens
pm2 save
pm2 startup
```

---

## 🔗 FRONTEND-BACKEND INTEGRATION

### Update Frontend API URL

In `frontend/.env`:

```
VITE_API_URL=https://your-backend-url.railway.app
```

### Example API Call (React)

```javascript
const API_URL = import.meta.env.VITE_API_URL;

// Login
const res = await fetch(`${API_URL}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const { access_token } = await res.json();
localStorage.setItem("authToken", access_token);

// Log Activity
await fetch(`${API_URL}/api/activities`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  },
  body: JSON.stringify({
    activity_type: "transport",
    value: 10,
    unit: "km",
  }),
});
```

---

## 📊 API ENDPOINTS

### Authentication

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token

### Activities

- `POST /api/activities` - Log activity
- `GET /api/activities` - Get user's activities

### Stats

- `GET /api/stats` - Get personal stats
- `GET /api/dashboard` - Full dashboard data

### Social

- `GET /api/leaderboard` - Campus rankings
- `GET /api/nudges` - AI nudges
- `PUT /api/nudges/{id}` - Mark nudge read

### Campus

- `GET /api/campus-stats` - Aggregate impact

---

## 🆘 TROUBLESHOOTING

### Backend Issues

**"ModuleNotFoundError: No module named 'fastapi'"**

```bash
pip install -r requirements.txt
```

**"postgres connection refused"**

```bash
# Check PostgreSQL is running
psql -U postgres
# Or restart docker
docker-compose restart postgres
```

**Port 8000 already in use**

```bash
# Use different port
uvicorn main:app --port 8001
```

### Frontend Issues

**"Cannot find module 'react'"**

```bash
npm install
```

**CORS errors**

- Ensure backend `VITE_API_URL` is correct
- Check backend CORS middleware allows your origin

**"Blank page after deploy"**

- Check browser console for errors
- Verify API_URL is set correctly
- Clear browser cache

---

## 🎯 PERFORMANCE OPTIMIZATION

### Backend

- Use connection pooling (SQLAlchemy default)
- Add Redis caching for leaderboard
- Implement rate limiting on API endpoints

### Frontend

- Images are lazy-loaded
- Code splitting enabled in Vite
- CSS is tree-shaken

### Database

- Index on `user_id` and `created_at` (automatic in models)
- Partition large activity tables by date

---

## 📈 MONITORING & LOGS

### Railway Dashboard

- Real-time logs visible in dashboard
- CPU/Memory/Network graphs
- Auto-restart on failure

### Local Development

```bash
# Backend logs
# (shown in terminal where uvicorn runs)

# Frontend logs
# (browser DevTools Console)
```

---

## 🔐 SECURITY CHECKLIST

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens with expiration
- ✅ CORS configured
- ✅ Input validation with Pydantic
- ✅ Environment variables for secrets
- ✅ HTTPS enforced in production
- ⚠️ TODO: Rate limiting
- ⚠️ TODO: CSRF protection
- ⚠️ TODO: SQL injection prevention (SQLAlchemy handles)

---

## 📝 NEXT STEPS

1. **Get Gemini API Key**
   - Go to https://makersuite.google.com/app/apikey
   - Create API key
   - Add to `.env`

2. **Deploy Backend**
   - Choose Railway or Render
   - Follow steps above
   - Get public URL

3. **Deploy Frontend**
   - Update API URL in `.env`
   - Deploy to Vercel/Netlify/Railway
   - Share with team

4. **Launch**
   - Test all features
   - Promote to Parul University
   - Monitor usage

---

## 🆘 SUPPORT

**Common Issues:**

- Backend won't start? → Check PostgreSQL is running
- Frontend blank? → Check console for API errors
- Auth failing? → Check SECRET_KEY in `.env`

**Get Help:**

- Check README files in `backend/` and `frontend/`
- Review FastAPI docs: https://fastapi.tiangolo.com
- React Router docs: https://reactrouter.com

---

## 🎉 YOU'RE READY!

Your complete GreenLens platform is built and ready to deploy. Pick your deployment option above and go live! 🚀
