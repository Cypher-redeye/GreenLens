# GreenLens Backend

Production-grade FastAPI backend for the AI-powered carbon tracking platform.

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── config.py              # Configuration management
├── database.py            # SQLAlchemy database setup
├── models.py              # SQLAlchemy ORM models
├── schemas.py             # Pydantic schemas for request/response
├── auth.py               # JWT authentication & password hashing
├── emission_factors.py    # CO2 calculation formulas
├── gemini_nudges.py       # AI nudge generation
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
├── Dockerfile            # Docker container configuration
└── README.md             # This file
```

## Features

✅ **User Authentication**

- JWT-based auth with bcrypt password hashing
- User registration & login endpoints
- Token refresh support

✅ **Activity Logging**

- Log 5 activity types: transport, food, electricity, purchases, waste
- Indian emission factors (CEA grid, FSSAI food data)
- Real-time CO2 calculation

✅ **Gamification**

- XP points system
- Weekly streaks
- Campus leaderboard with badges
- Trees saved equivalent calculation

✅ **AI Nudges**

- Gemini 1.5 Flash API integration
- Personalized, actionable tips
- Fallback nudges when API unavailable

✅ **Dashboard**

- Personal carbon stats
- Recent activities timeline
- Campus-wide impact metrics

## Local Setup

### Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Docker & Docker Compose (optional)

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Set Up PostgreSQL

**Option A: Using Docker (Recommended)**

```bash
cd ..
docker-compose up -d postgres
```

**Option B: Local PostgreSQL**

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### Step 3: Create Database

```bash
psql -U postgres
CREATE DATABASE greenlens;
\q
```

### Step 4: Configure Environment

```bash
cp .env.example .env
# Edit .env and set your values
```

### Step 5: Run the Backend

```bash
cd backend
python main.py
# Or with auto-reload:
uvicorn main:app --reload
```

The API will be live at `http://localhost:8000`
Swagger docs: `http://localhost:8000/docs`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Get JWT token

### Activities

- `POST /api/activities` - Log new activity
- `GET /api/activities` - Get user's activities

### User Stats

- `GET /api/stats` - Get personal carbon stats
- `GET /api/dashboard` - Get full dashboard

### Social

- `GET /api/leaderboard` - Get campus leaderboard
- `GET /api/nudges` - Get AI nudges
- `PUT /api/nudges/{id}` - Mark nudge as read

### Campus

- `GET /api/campus-stats` - Get aggregate campus impact

## Production Deployment

### Using Railway (Recommended)

1. **Create Railway Account**
   - Sign up at https://railway.app

2. **Connect GitHub**
   - Link your GitHub repo

3. **Create Database Plugin**
   - In Railway Dashboard → Add Plugin → PostgreSQL

4. **Deploy Backend**
   - Create new service → GitHub repo
   - Set environment variables in Railway:
     ```
     DATABASE_URL: (auto-filled from PostgreSQL plugin)
     SECRET_KEY: (generate strong key)
     GEMINI_API_KEY: (your API key)
     ```

5. **Get Public URL**
   - Railway auto-generates: `https://your-app.railway.app`

### Using Render

1. **Create Render Account**
   - Sign up at https://render.com

2. **Create PostgreSQL Database**
   - Dashboard → New+ → PostgreSQL
   - Copy internal database URL

3. **Deploy Web Service**
   - New+ → Web Service → Connect GitHub
   - Set Build Command: `pip install -r backend/requirements.txt`
   - Set Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables

### Using Docker + Heroku

```bash
# Login to Heroku
heroku login
heroku create your-greenlens-app

# Build & push Docker image
heroku container:push web -a your-greenlens-app
heroku container:release web -a your-greenlens-app

# Check logs
heroku logs --tail -a your-greenlens-app
```

## Frontend Integration

Update React app to use your backend URL:

```javascript
// In your React config:
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Example: Login
const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const { access_token } = await loginResponse.json();
localStorage.setItem("token", access_token);

// Example: Log activity
await fetch(`${API_BASE_URL}/api/activities`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
  body: JSON.stringify({
    activity_type: "transport",
    value: 10,
    unit: "km",
    description: "Bus to college",
  }),
});
```

## Technology Stack

- **Framework**: FastAPI (async Python)
- **Database**: PostgreSQL + SQLAlchemy ORM
- **Auth**: JWT + bcrypt
- **AI**: Google Gemini 1.5 Flash
- **Deployment**: Railway/Render/Docker
- **Monitoring**: Built-in FastAPI logging

## Environment Variables

```
DATABASE_URL          # PostgreSQL connection string
SECRET_KEY           # JWT secret (min 32 chars)
GEMINI_API_KEY       # Google Gemini API key
ALGORITHM            # JWT algorithm (HS256)
ACCESS_TOKEN_EXPIRE_MINUTES  # Token TTL
ENVIRONMENT          # development/production
```

## Troubleshooting

**"postgres connection refused"**

- Ensure PostgreSQL is running: `psql -U postgres`
- Check DATABASE_URL in .env

**"Could not validate credentials"**

- Verify token is in Authorization header
- Token format: `Authorization: Bearer <token>`

**"Gemini API error"**

- Check GEMINI_API_KEY is set correctly
- App will use fallback nudges if API unavailable

**Port 8000 already in use**

- Use different port: `uvicorn main:app --port 8001`

## License

Built for Parul University Sustainability Hackathon 2026
