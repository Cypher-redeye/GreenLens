from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from starlette.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt

from database import engine, get_db, Base
from models import User, Activity, UserStats, Leaderboard, Nudge
from schemas import (
    UserRegister, UserLogin, Token, UserResponse, ActivityCreate,
    ActivityResponse, UserStatsResponse, LeaderboardEntry, NudgeResponse,
    DashboardResponse
)
from emission_factors import calculate_co2, get_trees_equivalent
from gemini_nudges import generate_nudge
from vision import scan_receipt_or_food
from config import get_settings

Base.metadata.create_all(bind=engine)

app = FastAPI(title="GreenLens API", version="1.0.0")
settings = get_settings()
security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auth helpers ─────────────────────────────────────────────────────────────

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode["sub"] = str(to_encode["sub"])
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise exc
    except JWTError:
        raise exc

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise exc
    return user

# ── CO2 category mapping ──────────────────────────────────────────────────────

TYPE_TO_CATEGORY = {
    "transport": "car_km",
    "food": "vegetarian_meal",
    "electricity": "india_kwh",
    "purchases": "clothing_item",
    "waste": "plastic_kg",
}

# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"message": "GreenLens API v1.0.0 - Track Your Carbon. Change Your Campus."}

@app.post("/api/auth/register", response_model=Token)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email or username already registered")

    hashed = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed,
        campus=user_data.campus
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    db.add(UserStats(user_id=db_user.id))
    db.commit()

    token = create_access_token(data={"sub": db_user.id})
    return {"access_token": token, "token_type": "bearer", "user_id": db_user.id, "username": db_user.username}

@app.post("/api/auth/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(data={"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user_id": user.id, "username": user.username}

@app.get("/api/user/profile", response_model=UserResponse)
def get_profile(user: User = Depends(get_current_user)):
    return user

@app.post("/api/activities", response_model=ActivityResponse)
def log_activity(
    activity: ActivityCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    activity_type = activity.activity_type.lower()
    category_key = TYPE_TO_CATEGORY.get(activity_type, "car_km")
    if category_key == "india_kwh":
        category_key = "kwh"
    
    co2_kg = calculate_co2(activity_type, category_key, activity.value, activity.region)

    db_activity = Activity(
        user_id=user.id,
        activity_type=activity.activity_type,
        value=activity.value,
        unit=activity.unit,
        co2_kg=co2_kg,
        description=activity.description
    )
    db.add(db_activity)

    stats = db.query(UserStats).filter(UserStats.user_id == user.id).first()
    if stats:
        stats.total_co2_kg += co2_kg
        stats.weekly_co2_kg += co2_kg
        stats.xp_points += int(co2_kg * 10)
        stats.trees_saved_equivalent = get_trees_equivalent(stats.total_co2_kg)

    db.commit()
    db.refresh(db_activity)

    nudge_text = generate_nudge(
        activity_type=activity.activity_type,
        co2_amount=co2_kg,
        user_name=user.username,
        recent_activities=[]
    )
    if nudge_text:
        db.add(Nudge(user_id=user.id, content=nudge_text, category=activity.activity_type))
        db.commit()

    return db_activity

@app.post("/api/activities/scan")
async def scan_activity_image(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    image_bytes = await file.read()
    result = scan_receipt_or_food(image_bytes, file.content_type)
    
    if not result:
        raise HTTPException(
            status_code=500, 
            detail="Failed to analyze image. Please ensure the Gemini API key is configured."
        )
        
    return result

@app.get("/api/activities", response_model=list[ActivityResponse])
def get_activities(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10
):
    return db.query(Activity).filter(Activity.user_id == user.id).order_by(desc(Activity.created_at)).limit(limit).all()

@app.get("/api/stats", response_model=UserStatsResponse)
def get_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stats = db.query(UserStats).filter(UserStats.user_id == user.id).first()
    if not stats:
        stats = UserStats(user_id=user.id)
        db.add(stats)
        db.commit()
    return stats

@app.get("/api/dashboard", response_model=DashboardResponse)
def get_dashboard(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stats = db.query(UserStats).filter(UserStats.user_id == user.id).first()
    activities = db.query(Activity).filter(Activity.user_id == user.id).order_by(desc(Activity.created_at)).limit(10).all()
    today_co2 = sum(a.co2_kg for a in activities if a.created_at.date() == datetime.now().date())
    return {"user": user, "stats": stats, "recent_activities": activities, "today_co2": today_co2}

@app.get("/api/leaderboard", response_model=list[LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db), limit: int = 50):
    rows = db.query(
        User.username, UserStats.xp_points, UserStats.weekly_co2_kg,
        UserStats.streak_days, User.campus
    ).join(UserStats, User.id == UserStats.user_id).order_by(desc(UserStats.xp_points)).limit(limit).all()

    result = []
    for idx, (username, xp, weekly_co2, streak, campus) in enumerate(rows, 1):
        badge = {1: "🥇 Gold", 2: "🥈 Silver", 3: "🥉 Bronze"}.get(idx)
        result.append({
            "rank": idx,
            "username": username,
            "xp_points": xp,
            "weekly_co2_reduction": weekly_co2,
            "streak": streak,
            "badge": badge
        })
    return result

@app.get("/api/nudges", response_model=list[NudgeResponse])
def get_nudges(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 5
):
    return db.query(Nudge).filter(Nudge.user_id == user.id).order_by(desc(Nudge.created_at)).limit(limit).all()

@app.put("/api/nudges/{nudge_id}")
def mark_nudge_read(
    nudge_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    nudge = db.query(Nudge).filter(Nudge.id == nudge_id, Nudge.user_id == user.id).first()
    if not nudge:
        raise HTTPException(status_code=404, detail="Nudge not found")
    nudge.is_read = True
    db.commit()
    return {"message": "Nudge marked as read"}

@app.get("/api/campus-stats")
def get_campus_stats(db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).scalar()
    total_co2 = db.query(func.sum(UserStats.total_co2_kg)).scalar() or 0
    return {
        "students_tracking": total_users,
        "total_co2_kg": round(total_co2, 2),
        "trees_equivalent": int(total_co2 / 21),
        "campus": "Parul University"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)