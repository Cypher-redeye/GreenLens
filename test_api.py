import requests
import json

base_url = "https://greenlens-backend-n3ws.onrender.com"

def test_register():
    url = f"{base_url}/api/auth/register"
    payload = {
        "email": "test_user_unique_123@gmail.com",
        "username": "test_user_unique_123",
        "password": "password123",
        "full_name": "Test User",
        "campus": "Parul University"
    }
    headers = {"Content-Type": "application/json"}
    
    print(f"Registering user at {url}...")
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        print("Status Code:", response.status_code)
        print("Response Header:", response.headers)
        print("Response Body:", response.text)
    except Exception as e:
        print("Error during request:", e)

if __name__ == "__main__":
    test_register()
