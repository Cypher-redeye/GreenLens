import requests
import time

url = "https://greenlens-backend-n3ws.onrender.com/api/auth/register"
headers = {
    "Origin": "https://green-lens-tau.vercel.app",
    "Access-Control-Request-Method": "POST",
    "Access-Control-Request-Headers": "content-type"
}

print("Polling Render backend for CORS updates...")
start_time = time.time()
timeout = 300 # 5 minutes

while time.time() - start_time < timeout:
    try:
        # Send preflight OPTIONS request
        response = requests.options(url, headers=headers, timeout=5)
        cors_origin = response.headers.get("access-control-allow-origin")
        
        if response.status_code == 200 and cors_origin == "https://green-lens-tau.vercel.app":
            print(f"🎉 Success! CORS headers are active on Render.")
            print(f"Response status: {response.status_code}")
            print(f"Access-Control-Allow-Origin: {cors_origin}")
            break
        else:
            print(f"Waiting... Status: {response.status_code}, CORS Origin: {cors_origin}")
    except Exception as e:
        print("Waiting (exception):", e)
        
    time.sleep(10)
else:
    print("Timed out waiting for Render backend redeployment.")
