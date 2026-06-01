import os
import sys
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
import random

# Add the backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine, Base
from models import User, Activity, UserStats, Organization
from main import get_password_hash

def seed_data():
    db: Session = SessionLocal()
    try:
        print("🌱 Seeding Demo Data for Hackathon Pitch...")

        # 1. Create Organization
        org_name = "Hackathon Corp"
        org = db.query(Organization).filter(Organization.name == org_name).first()
        if not org:
            org = Organization(name=org_name)
            db.add(org)
            db.commit()
            db.refresh(org)
            print(f"✅ Created Organization: {org.name}")
        else:
            print(f"ℹ️ Organization {org.name} already exists.")

        # 2. Create Users
        users_data = [
            {"email": "admin@hackathon.corp", "username": "admin_boss", "full_name": "Alice Admin", "role": "admin"},
            {"email": "emp1@hackathon.corp", "username": "bob_emp", "full_name": "Bob Employee", "role": "employee"},
            {"email": "emp2@hackathon.corp", "username": "charlie_emp", "full_name": "Charlie Employee", "role": "employee"}
        ]

        created_users = []
        for u in users_data:
            user = db.query(User).filter(User.email == u["email"]).first()
            if not user:
                user = User(
                    email=u["email"],
                    username=u["username"],
                    full_name=u["full_name"],
                    hashed_password=get_password_hash("password123"),
                    campus=org.name,
                    org_id=org.id,
                    role=u["role"]
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                
                # Add stats
                db.add(UserStats(user_id=user.id))
                db.commit()
                print(f"✅ Created User: {user.username} ({user.role})")
            else:
                print(f"ℹ️ User {user.username} already exists.")
            created_users.append(user)

        # 3. Create Activities (over the last 4 weeks to populate the chart)
        print("📊 Generating activities for the chart...")
        activity_types = ["transport", "food", "electricity", "purchases", "waste"]
        
        for user in created_users:
            stats = db.query(UserStats).filter(UserStats.user_id == user.id).first()
            
            # Generate 5-10 activities per user
            for i in range(random.randint(5, 10)):
                days_ago = random.randint(0, 28)
                created_date = datetime.now(timezone.utc) - timedelta(days=days_ago)
                
                act_type = random.choice(activity_types)
                co2_val = random.uniform(2.0, 15.0)
                
                act = Activity(
                    user_id=user.id,
                    activity_type=act_type,
                    value=random.uniform(5.0, 50.0),
                    unit="unit",
                    co2_kg=co2_val,
                    description=f"Demo {act_type} logged",
                    created_at=created_date
                )
                db.add(act)
                
                # Update user stats manually to ensure consistency
                stats.total_co2_kg += co2_val
                stats.xp_points += int(co2_val * 10)
                
            db.commit()
        
        print("🎉 Seeding Complete! The Admin Dashboard is now fully populated.")
        print("👉 Login with: admin@hackathon.corp / password123")

    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
