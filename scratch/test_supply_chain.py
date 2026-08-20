import requests
import sys
import os

BASE_URL = "http://localhost:8000/api/v1"
TEST_IMG = r"d:\AYUVerify\dataset\verification\verify_Aloevera_test.jpg"

def login(email, password="Password123!"):
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if res.status_code != 200:
        print(f"Failed login for {email}: {res.text}")
        sys.exit(1)
    data = res.json()
    return data["accessToken"], data["user"]

def main():
    print("=== Testing AyurVerify Supply Chain API Workflow ===")

    # 1. Login Collector
    col_token, col_user = login("collector@ayurverify.com")
    col_headers = {"Authorization": f"Bearer {col_token}"}
    print(f"Logged in Collector: {col_user['name']} ({col_user['participantId']})")

    # 2. Perform AI prediction on real sample image
    with open(TEST_IMG, 'rb') as f:
        files = {'image': ('verify_Aloevera_test.jpg', f.read(), 'image/jpeg')}

    pred_res = requests.post(f"{BASE_URL}/predictions", files=files, headers=col_headers)
    print(f"Prediction response code: {pred_res.status_code}")
    if pred_res.status_code != 200:
        print(f"Prediction failed: {pred_res.text}")
        sys.exit(1)
    pred_data = pred_res.json()
    ident_id = pred_data.get("identificationId")
    print(f"AI Species Identified: {pred_data['material']['name']}, Confidence: {pred_data['confidence']}, ID: {ident_id}")

    # 3. Create Batch Passport
    batch_req = {
        "identificationId": ident_id,
        "materialId": pred_data['material']['id'],
        "sourceLocation": "Patan, Gujarat",
        "notes": "Harvested from certified organic farm"
    }
    batch_res = requests.post(f"{BASE_URL}/batches", json=batch_req, headers=col_headers)
    print(f"Create Batch status code: {batch_res.status_code}")
    batch_data = batch_res.json()
    batch_id = batch_data.get("batchId")
    print(f"Created Batch ID: {batch_id}, status: {batch_data.get('status')}")

    # 4. Search Wholesaler
    search_res = requests.get(f"{BASE_URL}/participants/search?role=WHOLESALER", headers=col_headers)
    wholesalers = search_res.json()
    print(f"Available Wholesalers: {[w['participantId'] for w in wholesalers]}")
    who_id = wholesalers[0]["participantId"]

    # 5. Transfer to Wholesaler
    trf_req = {"recipientId": who_id, "note": "Handoff to Wholesaler"}
    trf_res = requests.post(f"{BASE_URL}/batches/{batch_id}/transfer", json=trf_req, headers=col_headers)
    print(f"Transfer to Wholesaler status: {trf_res.status_code}, response: {trf_res.json()}")

    # 6. Login Wholesaler
    who_token, who_user = login("wholesaler@ayurverify.com")
    who_headers = {"Authorization": f"Bearer {who_token}"}
    print(f"Logged in Wholesaler: {who_user['name']} ({who_user['participantId']})")

    # Get incoming transfers
    inc_res = requests.get(f"{BASE_URL}/transfers/incoming", headers=who_headers)
    incoming = inc_res.json()
    print(f"Wholesaler incoming transfers count: {len(incoming)}")
    transfer_item = next((t for t in incoming if t["batchId"] == batch_id), None)
    if not transfer_item:
        print("Incoming transfer not found for Wholesaler!")
        sys.exit(1)
    
    trf_id = transfer_item["transferId"]

    # Accept Transfer
    acc_res = requests.post(f"{BASE_URL}/transfers/{trf_id}/accept", headers=who_headers)
    print(f"Accept transfer status: {acc_res.status_code}, {acc_res.json()}")

    # Wholesaler Physical Verification
    verify_req = {
        "visualIntegrity": True,
        "weightMatch": True,
        "sealCheck": True,
        "comments": "Wholesaler inspection passed. Package intact."
    }
    v_res = requests.post(f"{BASE_URL}/batches/{batch_id}/verify", json=verify_req, headers=who_headers)
    print(f"Wholesaler verification status: {v_res.status_code}, {v_res.json()}")

    # Search Distributor
    dis_res = requests.get(f"{BASE_URL}/participants/search?role=DISTRIBUTOR", headers=who_headers)
    distributors = dis_res.json()
    dis_id = distributors[0]["participantId"]

    # Transfer to Distributor
    trf2_res = requests.post(f"{BASE_URL}/batches/{batch_id}/transfer", json={"recipientId": dis_id, "note": "Handoff to Distributor"}, headers=who_headers)
    print(f"Transfer to Distributor status: {trf2_res.status_code}, {trf2_res.json()}")

    # 7. Login Distributor
    dis_token, dis_user = login("distributor@ayurverify.com")
    dis_headers = {"Authorization": f"Bearer {dis_token}"}
    print(f"Logged in Distributor: {dis_user['name']} ({dis_user['participantId']})")

    inc_dis = requests.get(f"{BASE_URL}/transfers/incoming", headers=dis_headers).json()
    trf_dis_item = next((t for t in inc_dis if t["batchId"] == batch_id), None)
    
    requests.post(f"{BASE_URL}/transfers/{trf_dis_item['transferId']}/accept", headers=dis_headers)
    requests.post(f"{BASE_URL}/batches/{batch_id}/verify", json={
        "visualIntegrity": True,
        "weightMatch": True,
        "sealCheck": True,
        "comments": "Distributor cargo check complete."
    }, headers=dis_headers)

    # Search Manufacturer
    man_res = requests.get(f"{BASE_URL}/participants/search?role=MANUFACTURER", headers=dis_headers)
    manufacturers = man_res.json()
    man_id = manufacturers[0]["participantId"]

    requests.post(f"{BASE_URL}/batches/{batch_id}/transfer", json={"recipientId": man_id, "note": "Handoff to Manufacturer"}, headers=dis_headers)

    # 8. Login Manufacturer
    man_token, man_user = login("manufacturer@ayurverify.com")
    man_headers = {"Authorization": f"Bearer {man_token}"}
    print(f"Logged in Manufacturer: {man_user['name']} ({man_user['participantId']})")

    inc_man = requests.get(f"{BASE_URL}/transfers/incoming", headers=man_headers).json()
    trf_man_item = next((t for t in inc_man if t["batchId"] == batch_id), None)

    requests.post(f"{BASE_URL}/transfers/{trf_man_item['transferId']}/accept", headers=man_headers)
    complete_res = requests.post(f"{BASE_URL}/batches/{batch_id}/verify", json={
        "visualIntegrity": True,
        "weightMatch": True,
        "sealCheck": True,
        "comments": "Manufacturer final quality release check passed."
    }, headers=man_headers)
    print(f"Manufacturer final verification response: {complete_res.json()}")

    # 9. Verify Passport details
    p_res = requests.get(f"{BASE_URL}/batches/{batch_id}", headers=man_headers)
    passport = p_res.json()
    print(f"\nFinal Passport Details for Batch: {batch_id}")
    print(f"Status: {passport['status']}")
    print(f"Material ID: {passport['materialId']}")
    print(f"Verification Records Count: {len(passport.get('verificationRecords', []))}")
    print(f"Timeline History Length: {len(passport.get('history', []))}")

    print("\nSUCCESS! Full supply chain API test completed clean.")

if __name__ == "__main__":
    main()
