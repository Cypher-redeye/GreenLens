import requests
import time

url = "https://greenlens-backend-n3ws.onrender.com"
start_time = time.time()
timeout = 300 # 5 minutes

print("Polling Render root endpoint for cors_patched marker...")

while time.time() - start_time < timeout:
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get("cors_patched") is True:
                print("🎉 SUCCESS! The redeployed version with CORS patch is live on Render!")
                print(f"Response: {data}")
                break
            else:
                print("Old version is still running...")
        else:
            print(f"Status code is {response.status_code}")
    except Exception as e:
        print("Waiting (exception):", e)
        
    time.sleep(10)
else:
    print("Timed out waiting for cors_patched marker.")
