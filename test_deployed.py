import requests
import json
import time

BASE_URL = "https://greenlens-backend-n3ws.onrender.com"

def test_flow():
    print(f"Testing {BASE_URL}...")
    
    # 1. Health check
    try:
        r = requests.get(f"{BASE_URL}/")
        print("GET / ->", r.status_code, r.text.encode('utf-8'))
    except Exception as e:
        print("Health check failed:", e)
        return

    # 2. Leaderboard
    r = requests.get(f"{BASE_URL}/api/leaderboard?limit=5")
    print("GET /api/leaderboard ->", r.status_code)

    # 3. Create test user
    uid = str(time.time()).replace(".","")
    email = f"test_{uid}@example.com"
    pwd = "password123"
    r = requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": email,
        "username": f"user_{uid}",
        "password": pwd,
        "full_name": "Test User",
        "campus": "Test Campus"
    })
    print("POST /api/auth/register ->", r.status_code)
    if r.status_code != 200:
        print(r.text)
        return
        
    token = r.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # 4. Dashboard
    r = requests.get(f"{BASE_URL}/api/dashboard", headers=headers)
    print("GET /api/dashboard ->", r.status_code)

    # 5. Log Activity
    r = requests.post(f"{BASE_URL}/api/activities", headers=headers, json={
        "activity_type": "transport",
        "value": 10.5,
        "unit": "km"
    })
    print("POST /api/activities ->", r.status_code)

    # 6. Fetch Nudges
    # Nudges are generated async, we wait 3 seconds
    time.sleep(10)
    r = requests.get(f"{BASE_URL}/api/nudges", headers=headers)
    print("GET /api/nudges ->", r.status_code)
    if r.status_code == 200:
        nudges = r.json()
        print("Nudges generated:", len(nudges))
        if nudges:
            print("Latest nudge:", nudges[0]['content'])

if __name__ == "__main__":
    test_flow()
