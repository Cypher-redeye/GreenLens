from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str
    campus: str = "Parul University"

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str

class UserBase(BaseModel):
    email: str
    username: str
    full_name: str
    campus: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ActivityCreate(BaseModel):
    activity_type: str
    value: float
    unit: str
    description: Optional[str] = None
    region: str = "IN"

class ActivityResponse(BaseModel):
    id: int
    activity_type: str
    value: float
    unit: str
    co2_kg: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserStatsResponse(BaseModel):
    total_co2_kg: float
    weekly_co2_kg: float
    streak_days: int
    xp_points: int
    rank: int
    trees_saved_equivalent: int
    
    class Config:
        from_attributes = True

class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    xp_points: int
    weekly_co2_reduction: float
    streak: int
    badge: Optional[str]
    
    class Config:
        from_attributes = True

class NudgeResponse(BaseModel):
    id: int
    content: str
    category: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class DashboardResponse(BaseModel):
    user: UserResponse
    stats: UserStatsResponse
    recent_activities: List[ActivityResponse]
    today_co2: float
