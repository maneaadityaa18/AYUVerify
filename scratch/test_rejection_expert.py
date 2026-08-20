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
    print("=== Testing Rejection & Expert Review Workflows ===")

    # 1. Login Collector & Create Batch 1 (for Rejection Test)
    col_token, col_user = login("collector@ayurverify.com")
    col_headers = {"Authorization": f"Bearer {col_token}"}

    with open(TEST_IMG, 'rb') as f:
        img_bytes = f.read()

    pred_res = requests.post(f"{BASE_URL}/predictions", files={'image': ('aloe1.jpg', img_bytes, 'image/jpeg')}, headers=col_headers)
    ident_id = pred_res.json()["identificationId"]

    batch1_res = requests.post(f"{BASE_URL}/batches", json={
        "identificationId": ident_id,
        "materialId": "MAT-001",
        "sourceLocation": "Surat, Gujarat",
        "notes": "Batch for Rejection Test"
    }, headers=col_headers).json()
    batch1_id = batch1_res["batchId"]
    print(f"Created Batch 1: {batch1_id}")

    # Transfer Batch 1 to Wholesaler
    who_token, who_user = login("wholesaler@ayurverify.com")
    who_headers = {"Authorization": f"Bearer {who_token}"}

    requests.post(f"{BASE_URL}/batches/{batch1_id}/transfer", json={
        "recipientId": who_user["participantId"],
        "note": "Rejection test transfer"
    }, headers=col_headers)

    # Wholesaler gets incoming transfer and REJECTS it
    incoming1 = requests.get(f"{BASE_URL}/transfers/incoming", headers=who_headers).json()
    trf1 = next(t for t in incoming1 if t["batchId"] == batch1_id)

    rej_res = requests.post(f"{BASE_URL}/transfers/{trf1['transferId']}/reject", json={
        "reason": "Package packaging seals broken and weight discrepancy of 5kg."
    }, headers=who_headers)
    print(f"Rejection result: {rej_res.json()}")

    b1_passport = requests.get(f"{BASE_URL}/batches/{batch1_id}", headers=col_headers).json()
    print(f"Batch 1 Status after rejection: {b1_passport['status']}")
    assert b1_passport['status'] == "REJECTED"

    # 2. Expert Review Test
    # Create Batch 2 (for Expert Review)
    pred2_res = requests.post(f"{BASE_URL}/predictions", files={'image': ('aloe2.jpg', img_bytes, 'image/jpeg')}, headers=col_headers)
    ident2_id = pred2_res.json()["identificationId"]

    batch2_res = requests.post(f"{BASE_URL}/batches", json={
        "identificationId": ident2_id,
        "materialId": "MAT-001",
        "sourceLocation": "Rajkot, Gujarat",
        "notes": "Batch for Expert Review Test"
    }, headers=col_headers).json()
    batch2_id = batch2_res["batchId"]
    print(f"\nCreated Batch 2 for Expert Review: {batch2_id}")

    # Transfer Batch 2 to Wholesaler
    requests.post(f"{BASE_URL}/batches/{batch2_id}/transfer", json={
        "recipientId": who_user["participantId"],
        "note": "Expert review test transfer"
    }, headers=col_headers)

    # Wholesaler Accepts Batch 2
    inc2 = requests.get(f"{BASE_URL}/transfers/incoming", headers=who_headers).json()
    trf2 = next(t for t in inc2 if t["batchId"] == batch2_id)
    requests.post(f"{BASE_URL}/transfers/{trf2['transferId']}/accept", headers=who_headers)

    # Wholesaler flags issue for Expert Review
    rep_res = requests.post(f"{BASE_URL}/batches/{batch2_id}/report-issue", json={
        "reason": "Wrong Material",
        "description": "Physical leaf morphological features resemble Agave instead of Aloevera."
    }, headers=who_headers)
    print(f"Report issue response: {rep_res.json()}")

    b2_passport = requests.get(f"{BASE_URL}/batches/{batch2_id}", headers=who_headers).json()
    print(f"Batch 2 Status after dispute flag: {b2_passport['status']}")
    assert b2_passport['status'] == "PENDING_EXPERT_REVIEW"

    # Expert Login & Decision
    exp_token, exp_user = login("expert@ayurverify.com")
    exp_headers = {"Authorization": f"Bearer {exp_token}"}
    print(f"Logged in Expert: {exp_user['name']} ({exp_user['participantId']})")

    reviews = requests.get(f"{BASE_URL}/expert/reviews", headers=exp_headers).json()
    print(f"Pending Expert Reviews Count: {len(reviews)}")
    rev_item = next(r for r in reviews if r["batchId"] == batch2_id)
    print(f"Expert review item: {rev_item['batchId']}, issue: {rev_item['reportedIssue']['reason']}")

    # Expert Approves Batch 2
    dec_res = requests.post(f"{BASE_URL}/expert/reviews/{batch2_id}/decision", json={
        "decision": "APPROVE",
        "notes": "Taxonomic microscopy confirms Aloe barbadensis miller cell structure."
    }, headers=exp_headers)
    print(f"Expert decision response: {dec_res.json()}")

    b2_passport_after = requests.get(f"{BASE_URL}/batches/{batch2_id}", headers=who_headers).json()
    print(f"Batch 2 Status after Expert clearance: {b2_passport_after['status']}")
    assert b2_passport_after['status'] == "VERIFIED"

    print("\nSUCCESS! Rejection & Expert Review workflows verified clean.")

if __name__ == "__main__":
    main()
