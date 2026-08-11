import os
import requests
import json

def run_e2e_test():
    base_url = "http://127.0.0.1:8000/api/v1"
    register_url = f"{base_url}/auth/register"
    login_url = f"{base_url}/auth/login"
    predict_url = f"{base_url}/predictions"
    
    workspace = r"d:\AYUVerify"
    test_img_path = os.path.join(workspace, "dataset", "yolo", "images", "test", "Aloevera_4230.jpg")
    
    print("=== STARTING E2E API VERIFICATION ===")
    
    # 1. Register test user
    register_payload = {
        "name": "Aditya Collector",
        "email": "test_collector@example.com",
        "password": "password123",
        "role": "COLLECTOR",
        "organizationName": "AyurCorp Preprocessing",
        "location": "Pune, India"
    }
    
    print("Step 1: Registering test Collector...")
    try:
        r_resp = requests.post(register_url, json=register_payload)
        if r_resp.status_code == 200:
            print("  Registration successful!")
        elif r_resp.status_code == 400 and "already exists" in r_resp.text:
            print("  User already registered (skipping registration).")
        else:
            print(f"  Registration warning/info: Status {r_resp.status_code}, Body: {r_resp.text}")
    except Exception as e:
        print(f"  Registration connection error: {str(e)}")
        # Fail early if connection cannot be established
        return False
        
    # 2. Login
    login_payload = {
        "email": "test_collector@example.com",
        "password": "password123"
    }
    
    print("\nStep 2: Logging in test Collector...")
    try:
        l_resp = requests.post(login_url, json=login_payload)
        if l_resp.status_code != 200:
            print(f"  FAILED: Login returned status {l_resp.status_code}. Body: {l_resp.text}")
            return False
            
        token_data = l_resp.json()
        token = token_data.get("accessToken")
        if not token:
            print(f"  FAILED: accessToken missing in login response. Data: {token_data}")
            return False
        print("  Login successful! Access token obtained.")
    except Exception as e:
        print(f"  Login connection error: {str(e)}")
        return False
        
    # 3. Call prediction API
    print(f"\nStep 3: Triggering AI Prediction with image: {test_img_path}")
    if not os.path.exists(test_img_path):
        print(f"  FAILED: Test image not found at {test_img_path}")
        return False
        
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        with open(test_img_path, 'rb') as img_file:
            files = {
                'image': ('Aloevera_4230.jpg', img_file, 'image/jpeg')
            }
            p_resp = requests.post(predict_url, headers=headers, files=files)
            
        if p_resp.status_code != 200:
            print(f"  FAILED: Prediction endpoint returned status {p_resp.status_code}. Body: {p_resp.text}")
            return False
            
        result = p_resp.json()
        print("\nStep 4: Validating Prediction Response Structure...")
        print(json.dumps(result, indent=2))
        
        # Verify required keys
        required_keys = ["success", "detections", "inference_time_ms", "device"]
        missing_keys = [k for k in required_keys if k not in result]
        
        if missing_keys:
            print(f"  FAILED: Response is missing required keys: {missing_keys}")
            return False
            
        print("  SUCCESS: Response structure is fully valid!")
        print(f"  - Inference Device: {result['device']}")
        print(f"  - Latency:          {result['inference_time_ms']} ms")
        print(f"  - Detections Count: {len(result['detections'])}")
        
        if len(result['detections']) > 0:
            print(f"  - Top Detection:    {result['detections'][0]['class_name']} ({result['detections'][0]['confidence']*100:.1f}%)")
        else:
            print("  - Detections:       No objects detected (expected for smoke-test weights).")
            
        return True
    except Exception as e:
        print(f"  Prediction error: {str(e)}")
        return False

if __name__ == '__main__':
    success = run_e2e_test()
    import sys
    sys.exit(0 if success else 1)
