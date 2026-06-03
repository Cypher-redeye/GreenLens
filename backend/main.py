import time
import logging
import csv
import io
from functools import lru_cache as ttl_cache

from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, BackgroundTasks, Request
from fastapi.responses import JSONResponse, Response
from starlette.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
import bcrypt
import imagehash
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from database import engine, get_db, Base
from models import User, Activity, UserStats, Nudge, Organization
from schemas import (
    UserRegister, UserLogin, Token, UserResponse, ActivityCreate,
    ActivityResponse, UserStatsResponse, LeaderboardEntry, NudgeResponse,
    DashboardResponse, OrganizationCreate, OrganizationResponse
)
from emission_factors import calculate_co2, get_trees_equivalent
from gemini_nudges import generate_nudge
from vision import scan_receipt_or_food, get_image_hash
from config import get_settings

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("greenlens")

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GreenLens API",
    version="2.0.0",
    description="Track Your Carbon. Change Your Campus. 🌿",
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

settings = get_settings()
security = HTTPBearer()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://green-lens-tau.vercel.app",
    "https://green-lens-om-sharmas-projects-322ceb48.vercel.app",
    "https://green-lens-om2317160-9624-om-sharmas-projects-322ceb48.vercel.app",
    "https://green-lens.vercel.app",
]
if settings.CORS_ORIGINS:
    extra_origins = [org.strip().rstrip("/") for org in settings.CORS_ORIGINS.split(",") if org.strip()]
    origins.extend(extra_origins)
if settings.CORS_ORIGIN:
    extra_origins = [org.strip().rstrip("/") for org in settings.CORS_ORIGIN.split(",") if org.strip()]
    origins.extend(extra_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Phase 3: Request Latency Middleware ───────────────────────────────────────

@app.middleware("http")
async def latency_logger(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "[%s] %s %s — %dms",
        response.status_code,
        request.method,
        request.url.path,
        duration_ms,
    )
    response.headers["X-Process-Time-Ms"] = f"{duration_ms:.2f}"
    return response

# ── Phase 2: In-Memory Cache ──────────────────────────────────────────────────

_cache: dict = {}

def get_cached(key: str, ttl_seconds: int = 30):
    """Simple TTL cache backed by an in-process dict."""
    entry = _cache.get(key)
    if entry and (time.time() - entry["ts"]) < ttl_seconds:
        return entry["value"]
    return None

def set_cached(key: str, value):
    _cache[key] = {"value": value, "ts": time.time()}

def invalidate_cache(*keys: str):
    for k in keys:
        _cache.pop(k, None)

# ── Auth helpers ───────────────────────────────────────────────────────────────

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode["sub"] = str(to_encode["sub"])
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
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

security_optional = HTTPBearer(auto_error=False)

def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security_optional),
    db: Session = Depends(get_db)
) -> User | None:
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None
    return db.query(User).filter(User.id == int(user_id)).first()

def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user

def is_image_duplicate(db: Session, new_hash_str: str) -> bool:
    if not new_hash_str:
        return False
    try:
        new_hash = imagehash.hex_to_hash(new_hash_str)
    except Exception:
        return False
        
    time_bound = datetime.now(timezone.utc) - timedelta(days=30)
    # Fetch all hashes from the last 30 days
    recent_activities = db.query(Activity.image_hash).filter(
        Activity.created_at >= time_bound,
        Activity.image_hash.isnot(None)
    ).all()
    
    for (stored_hash_str,) in recent_activities:
        try:
            stored_hash = imagehash.hex_to_hash(stored_hash_str)
            # A Hamming distance of <= 5 indicates the images are very similar
            if new_hash - stored_hash <= 5:
                return True
        except Exception:
            continue
    return False

# ── CO2 category mapping ───────────────────────────────────────────────────────

TYPE_TO_CATEGORY = {
    "transport": "car_km",
    "food": "vegetarian_meal",
    "electricity": "kwh",
    "purchases": "clothing_item",
    "waste": "plastic_kg",
}

# ── Phase 1: Background Task for AI Nudge ────────────────────────────────────

def _create_nudge_task(user_id: int, activity_type: str, co2_kg: float, username: str):
    """Runs in a background thread — non-blocking for the HTTP response."""
    try:
        nudge_text = generate_nudge(
            activity_type=activity_type,
            co2_amount=co2_kg,
            user_name=username,
            recent_activities=[],
        )
        if nudge_text:
            from database import SessionLocal
            db = SessionLocal()
            try:
                db.add(Nudge(user_id=user_id, content=nudge_text, category=activity_type))
                db.commit()
                logger.info("🤖 Nudge generated for user %d (%s)", user_id, activity_type)
            finally:
                db.close()
    except Exception as e:
        logger.error("Nudge generation failed: %s", e)

# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def read_root():
    return {
        "message": "GreenLens API v2.0.0 — Track Your Carbon. Change Your Campus. 🌿",
        "status": "healthy",
        "db": "neon_postgresql",
        "cors_patched": True,
    }

@app.post("/api/auth/register", response_model=Token, tags=["Auth"])
@limiter.limit("5/minute")
def register(request: Request, user_data: UserRegister, db: Session = Depends(get_db)):
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
        campus=user_data.campus,
        org_id=user_data.org_id,
        role=user_data.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    db.add(UserStats(user_id=db_user.id))
    db.commit()

    token = create_access_token(data={"sub": db_user.id})
    return {"access_token": token, "token_type": "bearer", "user_id": db_user.id, "username": db_user.username}

import string
import random

def generate_invite_code(db: Session, length=6) -> str:
    characters = string.ascii_uppercase + string.digits
    while True:
        code = ''.join(random.choices(characters, k=length))
        if not db.query(Organization).filter(Organization.invite_code == code).first():
            return code

@app.post("/api/organizations", response_model=OrganizationResponse, tags=["Organizations"])
@limiter.limit("5/minute")
def create_organization(request: Request, org_data: OrganizationCreate, db: Session = Depends(get_db)):
    existing = db.query(Organization).filter(Organization.name == org_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Organization already exists")
    invite_code = generate_invite_code(db)
    db_org = Organization(name=org_data.name, invite_code=invite_code)
    db.add(db_org)
    db.commit()
    db.refresh(db_org)
    return db_org

@app.get("/api/organizations/{org_id}/stats", tags=["Organizations"])
def get_org_stats(org_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    if admin.org_id != org_id:
        raise HTTPException(status_code=403, detail="Not authorized for this organization")
    org = db.query(Organization).filter(Organization.id == org_id).first()
    total_co2 = db.query(func.sum(UserStats.total_co2_kg)).join(User).filter(User.org_id == org_id).scalar() or 0
    employee_count = db.query(func.count(User.id)).filter(User.org_id == org_id).scalar() or 0
    return {"org_id": org_id, "total_co2_saved": total_co2, "employee_count": employee_count, "invite_code": org.invite_code if org else None}

@app.get("/api/organizations/invite/{invite_code}", response_model=OrganizationResponse, tags=["Organizations"])
def get_organization_by_invite(invite_code: str, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.invite_code == invite_code.upper()).first()
    if not org:
        raise HTTPException(status_code=404, detail="Invalid invite code")
    return org

@app.get("/api/organizations/{org_id}/export", tags=["Organizations"])
def export_org_activities(org_id: int, format: str = "csv", db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    if admin.org_id != org_id:
        raise HTTPException(status_code=403, detail="Not authorized for this organization")
        
    activities = db.query(Activity, User.username).join(User, Activity.user_id == User.id).filter(User.org_id == org_id).all()
    
    if format.lower() == "pdf":
        from fpdf import FPDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("helvetica", "B", 16)
        pdf.cell(0, 10, f"GreenLens Organization {org_id} Report", ln=True, align="C")
        pdf.ln(10)
        
        pdf.set_font("helvetica", "B", 10)
        headers = ["ID", "User", "Type", "Value", "Unit", "CO2 (kg)", "Date"]
        col_widths = [15, 30, 25, 20, 20, 25, 45]
        
        for i, header in enumerate(headers):
            pdf.cell(col_widths[i], 10, header, border=1)
        pdf.ln()
        
        pdf.set_font("helvetica", "", 10)
        for activity, username in activities:
            date_str = activity.created_at.strftime("%Y-%m-%d %H:%M") if activity.created_at else ""
            pdf.cell(col_widths[0], 10, str(activity.id), border=1)
            pdf.cell(col_widths[1], 10, username[:15], border=1)
            pdf.cell(col_widths[2], 10, activity.activity_type[:12], border=1)
            pdf.cell(col_widths[3], 10, f"{activity.value:.2f}", border=1)
            pdf.cell(col_widths[4], 10, activity.unit[:10], border=1)
            pdf.cell(col_widths[5], 10, f"{activity.co2_kg:.2f}", border=1)
            pdf.cell(col_widths[6], 10, date_str, border=1)
            pdf.ln()
            
        pdf_bytes = pdf.output()
        response = Response(content=bytes(pdf_bytes), media_type="application/pdf")
        response.headers["Content-Disposition"] = f"attachment; filename=greenlens_org_{org_id}_report.pdf"
        return response
        
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Activity ID", "Username", "Type", "Value", "Unit", "CO2 Saved (kg)", "Date", "Description"])
    
    for activity, username in activities:
        writer.writerow([
            activity.id,
            username,
            activity.activity_type,
            activity.value,
            activity.unit,
            round(activity.co2_kg, 2),
            activity.created_at.strftime("%Y-%m-%d %H:%M:%S") if activity.created_at else "",
            activity.description or ""
        ])
        
    response = Response(content=output.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=greenlens_org_{org_id}_report.csv"
    return response

@app.post("/api/auth/login", response_model=Token, tags=["Auth"])
@limiter.limit("10/minute")
def login(request: Request, user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(data={"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user_id": user.id, "username": user.username}

@app.get("/api/user/profile", response_model=UserResponse, tags=["User"])
def get_profile(user: User = Depends(get_current_user)):
    return user

@app.post("/api/activities", response_model=ActivityResponse, tags=["Activities"])
@limiter.limit("30/minute")
def log_activity(
    request: Request,
    activity: ActivityCreate,
    background_tasks: BackgroundTasks,          # ← Phase 1: inject background tasks
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    activity_type = activity.activity_type.lower()
    category_key = TYPE_TO_CATEGORY.get(activity_type, "car_km")
    co2_kg = calculate_co2(activity_type, category_key, activity.value, activity.region)
    
    if co2_kg > 1000:
        raise HTTPException(status_code=400, detail="CO2 value exceeds reasonable limits. Cheat prevention active.")

    if activity.image_hash and is_image_duplicate(db, activity.image_hash):
        raise HTTPException(status_code=400, detail="This exact image has already been logged. Spam detected.")
    
    if activity.receipt_id:
        existing = db.query(Activity).filter(Activity.receipt_id == activity.receipt_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="This receipt has already been logged. Spam detected.")

    last_activity = db.query(Activity).filter(Activity.user_id == user.id).order_by(desc(Activity.created_at)).first()

    db_activity = Activity(
        user_id=user.id,
        activity_type=activity.activity_type,
        value=activity.value,
        unit=activity.unit,
        co2_kg=co2_kg,
        description=activity.description,
        image_hash=activity.image_hash,
        receipt_id=activity.receipt_id,
        sdg_goal=activity.sdg_goal
    )
    db.add(db_activity)

    stats = db.query(UserStats).filter(UserStats.user_id == user.id).first()
    if stats:
        if last_activity:
            last_date = last_activity.created_at.date()
            if last_activity.created_at.tzinfo is not None:
                today = datetime.now(timezone.utc).date()
            else:
                today = datetime.now().date()
                
            if last_date == today - timedelta(days=1):
                stats.streak_days += 1
            elif last_date < today - timedelta(days=1):
                stats.streak_days = 1
        else:
            stats.streak_days = 1

        stats.total_co2_kg += co2_kg
        stats.weekly_co2_kg += co2_kg
        stats.xp_points += max(1, int(co2_kg * 10))
        stats.trees_saved_equivalent = get_trees_equivalent(stats.total_co2_kg)

    db.commit()
    db.refresh(db_activity)

    # Phase 1: Fire-and-forget AI nudge — does NOT block the response
    background_tasks.add_task(
        _create_nudge_task,
        user.id,
        activity.activity_type,
        co2_kg,
        user.username,
    )

    # Invalidate leaderboard & campus caches since XP changed
    invalidate_cache(f"leaderboard_{user.org_id}", f"campus_stats_{user.org_id}", "campus_stats_global")

    logger.info("✅ Activity logged: %s %.2f kg CO₂ (user=%s)", activity_type, co2_kg, user.username)
    return db_activity

@app.post("/api/activities/scan", tags=["Activities"])
@limiter.limit("5/minute")
async def scan_activity_image(
    request: Request,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()
    if len(image_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 5MB.")
    
    # Check for visual duplicate before calling Gemini API (saves cost & time)
    image_hash = get_image_hash(image_bytes)
    if is_image_duplicate(db, image_hash):
        raise HTTPException(status_code=400, detail="This exact image has already been logged. Spam detected.")
        
    result = scan_receipt_or_food(image_bytes, file.content_type)

    if not result:
        raise HTTPException(
            status_code=500,
            detail="Failed to analyze image. Please ensure the Gemini API key is configured."
        )

    logger.info("📸 Vision scan complete (user=%s, type=%s)", user.username, result.get("activity_type"))
    return result

@app.get("/api/activities", response_model=list[ActivityResponse], tags=["Activities"])
def get_activities(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10,
    org_wide: bool = False
):
    if org_wide:
        return db.query(Activity).join(User).filter(User.org_id == user.org_id).order_by(desc(Activity.created_at)).limit(limit).all()
    return db.query(Activity).filter(Activity.user_id == user.id).order_by(desc(Activity.created_at)).limit(limit).all()

@app.get("/api/stats", response_model=UserStatsResponse, tags=["Stats"])
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

@app.get("/api/dashboard", response_model=DashboardResponse, tags=["Stats"])
def get_dashboard(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stats = db.query(UserStats).filter(UserStats.user_id == user.id).first()
    activities = db.query(Activity).filter(Activity.user_id == user.id).order_by(desc(Activity.created_at)).limit(10).all()
    today_co2 = sum(a.co2_kg for a in activities if a.created_at.date() == datetime.now().date())
    return {"user": user, "stats": stats, "recent_activities": activities, "today_co2": today_co2}

@app.get("/api/leaderboard", response_model=list[LeaderboardEntry], tags=["Social"])
def get_leaderboard(db: Session = Depends(get_db), limit: int = 50, user: User = Depends(get_current_user)):
    # Phase 2: Return cached result if fresh (30s TTL)
    cache_key = f"leaderboard_{user.org_id}"
    cached = get_cached(cache_key, ttl_seconds=30)
    if cached:
        logger.info("⚡ Leaderboard served from cache")
        return cached

    rows = db.query(
        User.username, UserStats.xp_points, UserStats.weekly_co2_kg,
        UserStats.streak_days, User.campus
    ).join(UserStats, User.id == UserStats.user_id).filter(User.org_id == user.org_id).order_by(desc(UserStats.xp_points)).limit(limit).all()

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

    set_cached(cache_key, result)
    return result

@app.get("/api/nudges", response_model=list[NudgeResponse], tags=["AI"])
def get_nudges(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 5
):
    return db.query(Nudge).filter(Nudge.user_id == user.id).order_by(desc(Nudge.created_at)).limit(limit).all()

@app.put("/api/nudges/{nudge_id}", tags=["AI"])
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

@app.get("/api/campus-stats", tags=["Social"])
def get_campus_stats(db: Session = Depends(get_db), user: User = Depends(get_current_user_optional)):
    # Phase 2: Cache campus stats for 30 seconds
    org_id = user.org_id if user else None
    cache_key = f"campus_stats_{org_id}" if org_id else "campus_stats_global"
    cached = get_cached(cache_key, ttl_seconds=30)
    if cached:
        logger.info("⚡ Campus stats served from cache")
        return cached

    if org_id:
        total_users = db.query(func.count(User.id)).filter(User.org_id == org_id).scalar()
        total_co2 = db.query(func.sum(UserStats.total_co2_kg)).join(User).filter(User.org_id == org_id).scalar() or 0
        org_name = db.query(Organization.name).filter(Organization.id == org_id).scalar() or "Your Organization"
    else:
        total_users = db.query(func.count(User.id)).scalar()
        total_co2 = db.query(func.sum(UserStats.total_co2_kg)).scalar() or 0
        org_name = "Global Impact"
    
    result = {
        "students_tracking": total_users,
        "total_co2_kg": round(total_co2, 2),
        "trees_equivalent": int(total_co2 / 21),
        "campus": org_name,
    }

    set_cached(cache_key, result)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")