# 🌿 GreenLens - Quick Start Guide

Your complete **full-stack carbon tracking platform** is ready! Here's how to get it running.

---

## ⚡ 5-MINUTE SETUP

### Step 1: Backend Setup

```bash
cd c:\Users\ankit\OneDrive\Desktop\GreenLens\backend

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env
```

### Step 2: Start PostgreSQL (Choose ONE)

**With Docker (Easiest):**

```bash
cd ..
docker-compose up -d postgres
# Wait 10 seconds for it to start
```

**OR Manual PostgreSQL:**

- Download from: https://www.postgresql.org/download/windows/
- During install, remember your password
- Create database:
  ```
  psql -U postgres
  CREATE DATABASE greenlens;
  \q
  ```
- Edit `backend/.env`: Change `DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/greenlens`

### Step 3: Run Backend

```bash
cd backend
python main.py
```

✅ **Backend is live at http://localhost:8000**

Test it: Open http://localhost:8000/docs (Swagger UI)

### Step 4: Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

✅ **Frontend is live at http://localhost:3000**

---

## 🎮 TESTING LOCALLY

### Create Account

1. Go to http://localhost:3000
2. Click "Sign Up"
3. Fill in:
   - Email: test@example.com
   - Username: eco_warrior
   - Password: TestPass123
   - Name: Your Name
   - Campus: Parul University

### Log an Activity

1. Click "Log Today" (or "Start Tracking" from home)
2. Select "Transport"
3. Drag slider to 10 km
4. Click "Log Activity"
5. See CO₂ calculation instantly! 🌱

### View Dashboard

1. Click "Dashboard"
2. See your personal stats and recent activities
3. View AI coach nudges
4. Check leaderboard

---

## 🚀 PRODUCTION DEPLOYMENT (Choose ONE)

### Option 1: Railway (Recommended - Easiest)

**1. Create account at https://railway.app**

**2. Create PostgreSQL database:**

- Dashboard → New Project → Add Plugin → PostgreSQL
- Copy the internal connection string

**3. Deploy Backend:**

- New Service → Select your GitHub repo
- Root Directory: `backend`
- Set environment variables:
  ```
  DATABASE_URL=<from PostgreSQL plugin>
  SECRET_KEY=your-secret-key-32-chars
  GEMINI_API_KEY=<your-api-key-optional>
  ```
- Railway auto-deploys → You get a public URL

**4. Deploy Frontend:**

- New Service → Select your GitHub repo
- Root Directory: `frontend`
- Build Command: `npm run build`
- Environment Variables:
  ```
  VITE_API_URL=https://your-backend-url.railway.app
  ```

Done! Your app is live! 🎉

### Option 2: Render (Free tier available)

**Backend:**

1. https://render.com → New → Web Service
2. Build: `pip install -r backend/requirements.txt`
3. Start: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add PostgreSQL from dashboard
5. Deploy

**Frontend:**

1. New → Static Site
2. Build: `cd frontend && npm run build`
3. Directory: `frontend/dist`
4. Deploy

### Option 3: Docker Compose (Local/VPS)

```bash
# From root directory
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 🔧 CONFIGURATION

### Gemini API (Optional - For AI Nudges)

1. Get free API key: https://makersuite.google.com/app/apikey
2. Add to `backend/.env`:
   ```
   GEMINI_API_KEY=sk-your-key-here
   ```
3. Restart backend

If you skip this, fallback nudges will be used (still works great!).

### Database Setup

**Default credentials in `.env.example`:**

- User: `user`
- Password: `password`
- Database: `greenlens`

For production, use Railway/Render managed databases (auto-configured).

---

## 📊 WHAT YOU HAVE

### Backend Features ✅

- JWT authentication with bcrypt
- 5 activity types (transport, food, electricity, purchases, waste)
- Indian emission factors (CEA grid intensity, FSSAI food data)
- Gemini AI for personalized nudges
- Leaderboard with rankings & badges
- Campus-wide impact metrics
- Full REST API with 20+ endpoints

### Frontend Features ✅

- 6 fully functional pages
- Real-time CO₂ calculations
- Weekly charts with Recharts
- Glassmorphism dark theme
- Responsive mobile-friendly design
- JWT token management
- Protected routes

### Database ✅

- PostgreSQL with 6 tables (Users, Activities, Stats, Leaderboard, Nudges, Transactions)
- Automatic timestamps
- Cascade delete relationships
- Optimized indexes

---

## 🐛 TROUBLESHOOTING

| Problem                       | Solution                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------- |
| "postgres connection refused" | Ensure PostgreSQL is running: `psql -U postgres`                             |
| "Cannot find module"          | Run `pip install -r requirements.txt` (backend) or `npm install` (frontend)  |
| Port 8000 already in use      | `netstat -ano \| findstr :8000` then kill the process, or use different port |
| Blank frontend page           | Check DevTools console (F12). Verify API URL is correct in `.env`            |
| Login fails                   | Check backend is running at http://localhost:8000/docs                       |
| API returns 401               | Token expired or not set. Clear localStorage and login again                 |

---

## 📈 NEXT STEPS

1. **Test everything locally** (5 mins)
2. **Deploy backend to Railway** (5 mins)
3. **Deploy frontend to Railway/Vercel** (5 mins)
4. **Share the live URL** with your team
5. **Monitor with Railway dashboard**
6. **Iterate based on feedback**

---

## 📚 DETAILED DOCS

- **Backend**: See `backend/README.md`
- **Frontend**: See `frontend/README.md`
- **Full Guide**: See `DEPLOYMENT.md`

---

## 🎉 YOU'RE READY!

Your full-stack GreenLens platform is complete and production-ready. Deploy it now and change your campus! 🌱

Questions? Check the README files or test endpoints at `/docs` on your backend.

**LET'S GO!** 🚀
