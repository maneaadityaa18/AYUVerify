import os
import time
from typing import List, Optional
from datetime import datetime
import torch
from ultralytics import YOLO
from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson.objectid import ObjectId
import pymongo

from .config import settings
from .database import db, seed_database
from .security import hash_password, verify_password, create_access_token, decode_access_token
from .models import UserRegister, UserLogin, UserResponse, TokenResponse, BatchCreate, BatchVerify, TransferCreate, TransferReject

# Initialize FastAPI App
app = FastAPI(
    title="AyurVerify API Server",
    description="Secure supply-chain ledger and AI raw material verification backend.",
    version="1.0.0"
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files for Uploads
upload_dir_path = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads"))
os.makedirs(upload_dir_path, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir_path), name="uploads")

# Startup Seeding Event
@app.on_event("startup")
def on_startup():
    seed_database()

# Bearer token security scheme
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Dependency to retrieve the logged-in user from the JWT bearer token."""
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has expired or is invalid. Please log in again."
        )
    
    email = payload["sub"]
    user = db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists."
        )
    
    # Convert MongoDB _id to string for model mapping
    user["id"] = str(user["_id"])
    return user

# ==========================================
# 0. Health Route
# ==========================================
@app.get("/health")
def get_health():
    return {
        "status": "ok",
        "service": "AyurVerify API"
    }

# ==========================================
# 1. Authentication Routes
# ==========================================
@app.post("/api/v1/auth/register", response_model=UserResponse)
def register_user(req: UserRegister):
    users_collection = db["users"]
    
    # Check email uniqueness
    if users_collection.find_one({"email": req.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "EMAIL_ALREADY_REGISTERED", "message": "An account with this email already exists."}
        )
        
    # Generate Unique Participant ID (e.g. COL-0001, WHO-0002)
    role_prefixes = {
        "COLLECTOR": "COL",
        "WHOLESALER": "WHO",
        "DISTRIBUTOR": "DIS",
        "MANUFACTURER": "MAN",
        "EXPERT": "EXP",
        "ADMIN": "ADM"
    }
    prefix = role_prefixes.get(req.role, "PAR")
    count = users_collection.count_documents({"role": req.role}) + 1
    participant_id = f"{prefix}-{count:04d}"
    
    # Create user document
    user_doc = {
        "participantId": participant_id,
        "name": req.name,
        "email": req.email,
        "hashedPassword": hash_password(req.password),
        "role": req.role,
        "organizationName": req.organizationName,
        "location": req.location,
        "createdAt": datetime.utcnow().isoformat()
    }
    
    users_collection.insert_one(user_doc)
    return UserResponse(
        participantId=participant_id,
        name=req.name,
        email=req.email,
        role=req.role,
        organizationName=req.organizationName,
        location=req.location
    )

@app.post("/api/v1/auth/login", response_model=TokenResponse)
def login_user(req: UserLogin):
    users_collection = db["users"]
    user = users_collection.find_one({"email": req.email})
    
    if not user or not verify_password(req.password, user["hashedPassword"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_CREDENTIALS", "message": "Incorrect email or password."}
        )
        
    access_token = create_access_token(data={"sub": user["email"]})
    
    user_res = UserResponse(
        participantId=user["participantId"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        organizationName=user["organizationName"],
        location=user["location"]
    )
    
    return TokenResponse(
        accessToken=access_token,
        tokenType="bearer",
        user=user_res
    )

@app.get("/api/v1/auth/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        participantId=current_user["participantId"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
        organizationName=current_user["organizationName"],
        location=current_user["location"]
    )

# ==========================================
# 2. Materials (Botanical Knowledge Base)
# ==========================================
@app.get("/api/v1/materials")
def get_materials(current_user: dict = Depends(get_current_user)):
    materials = list(db["materials"].find({}))
    for m in materials:
        m["_id"] = str(m["_id"])
    return materials

@app.get("/api/v1/materials/{materialId}")
def get_material(materialId: str, current_user: dict = Depends(get_current_user)):
    m = db["materials"].find_one({"materialId": materialId})
    if not m:
        raise HTTPException(status_code=404, detail="Material classification not found.")
    m["_id"] = str(m["_id"])
    return m

# ==========================================
# 3. AI Prediction Placeholder (YOLOv8 Hook Setup)
# ==========================================
# Lazy-loaded YOLOv8n detector model helper
_yolo_model = None

def get_yolo_model():
    global _yolo_model
    if _yolo_model is None:
        workspace = r"d:\AYUVerify"
        weights_path = os.path.join(workspace, "runs", "ayurverify_yolov8n", "weights", "best.pt")
        if not os.path.exists(weights_path):
            mpbd_weights = os.path.join(workspace, "runs", "mpbd18_smoke_test", "weights", "best.pt")
            smoke_weights = os.path.join(workspace, "runs", "detect_smoke_test", "weights", "best.pt")
            if os.path.exists(mpbd_weights):
                weights_path = mpbd_weights
            elif os.path.exists(smoke_weights):
                weights_path = smoke_weights
            else:
                weights_path = "yolov8n.pt"
        _yolo_model = YOLO(weights_path)
    return _yolo_model

@app.post("/api/v1/predictions")
def predict_crop(image: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    # Validate MIME type and file limit parameters (Section 90.1)
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only raw image file uploads are supported.")
        
    # Safe prediction ID setup
    identification_id = f"ID-2026-{int(time.time() * 1000) % 100000:05d}"
    
    # Save image file to uploads folder
    upload_dir_path = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads"))
    os.makedirs(upload_dir_path, exist_ok=True)
    
    file_ext = os.path.splitext(image.filename)[1]
    safe_filename = f"{identification_id}{file_ext}"
    dest_path = os.path.join(upload_dir_path, safe_filename)
    
    try:
        with open(dest_path, "wb") as f:
            f.write(image.file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded image: {str(e)}")
        
    # Read image to get dimensions
    import cv2
    img = cv2.imread(dest_path)
    if img is None:
        if os.path.exists(dest_path):
            os.remove(dest_path)
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid readable image.")
        
    img_h, img_w = img.shape[:2]
    
    # Run YOLOv8n inference
    device = "cuda" if torch.cuda.is_available() else "cpu"
    try:
        model = get_yolo_model()
        start_time = time.time()
        results = model(dest_path, device=device, verbose=False)
        inference_time_ms = (time.time() - start_time) * 1000
    except Exception as e:
        if os.path.exists(dest_path):
            os.remove(dest_path)
        raise HTTPException(status_code=500, detail=f"Model inference failed: {str(e)}")
        
    # Parse YOLO boxes with dynamic fallback class map
    detections = []
    default_class_names = {0: "Ashwagandha", 1: "Tulshi", 2: "Bel", 3: "Aloevera", 4: "Amla"}
    model_names = model.names if hasattr(model, 'names') and model.names else {}
    
    if results and len(results[0].boxes) > 0:
        for box in results[0].boxes:
            cls_id = int(box.cls[0].item())
            conf = float(box.conf[0].item())
            material_name = model_names.get(cls_id, default_class_names.get(cls_id, f"Material_{cls_id}"))
            xyxy = box.xyxy[0].tolist()
            x1, y1, x2, y2 = map(int, xyxy)
            
            # Map class name (skip other classes for prototype)
            if cls_id in class_names:
                detections.append({
                    "class_id": cls_id,
                    "class_name": class_names[cls_id],
                    "confidence": round(conf, 4),
                    "bbox": {
                        "x1": x1,
                        "y1": y1,
                        "x2": x2,
                        "y2": y2
                    },
                    "normalized_bbox": {
                        "x1": round(x1 / img_w, 4),
                        "y1": round(y1 / img_h, 4),
                        "x2": round(x2 / img_w, 4),
                        "y2": round(y2 / img_h, 4)
                    }
                })
                
    # Sort detections by confidence descending
    detections = sorted(detections, key=lambda x: x["confidence"], reverse=True)
    
    # Handle "no detections"
    if not detections:
        response = {
            "success": True,
            "detections": [],
            "message": "No supported medicinal material detected.",
            "inference_time_ms": round(inference_time_ms, 2),
            "device": device
        }
        return response
        
    # Primary detection details
    primary_det = detections[0]
    class_name = primary_det["class_name"]
    best_confidence = primary_det["confidence"]
    
    # Look up matching material in MongoDB
    material_rec = db["materials"].find_one({"materialName": {"$regex": f"^{class_name}$", "$options": "i"}})
    
    prediction_result = {
        "success": True,
        "detections": detections,
        "inference_time_ms": round(inference_time_ms, 2),
        "device": device,
        "identificationId": identification_id,
        "userId": current_user.get("participantId", "SYSTEM"),
        "imageUrl": f"/uploads/{safe_filename}",
        "material": {
            "id": material_rec["materialId"] if material_rec else "MAT-004",
            "name": material_rec["materialName"] if material_rec else class_name,
            "scientificName": material_rec["scientificName"] if material_rec else "Aloe barbadensis miller"
        },
        "confidence": best_confidence,
        "riskLevel": "LOW" if best_confidence > 0.7 else "MEDIUM",
        "status": "AI_IDENTIFIED",
        "imageQuality": "GOOD",
        "createdAt": datetime.utcnow().isoformat()
    }
    
    # Save identification record
    db["identifications"].insert_one(prediction_result.copy())
    
    # Map _id object to string
    prediction_result["_id"] = str(prediction_result.get("_id", ""))
    return prediction_result

# ==========================================
# 4. Batches Routes
# ==========================================
@app.post("/api/v1/batches")
def create_batch(req: BatchCreate, current_user: dict = Depends(get_current_user)):
    # Role gate: Only Collectors can initiate batches (Section 13)
    if current_user["role"] != "COLLECTOR":
        raise HTTPException(status_code=403, detail="Only Collector participants can register new batches.")
        
    # Check identification eligibility
    ident = db["identifications"].find_one({"identificationId": req.identificationId})
    if not ident:
        raise HTTPException(status_code=404, detail="Crop identification record not found.")
        
    # Check if batch was already registered
    existing = db["batches"].find_one({"identificationId": req.identificationId})
    if existing:
        raise HTTPException(status_code=400, detail="A digital passport batch has already been created for this crop identification.")
        
    # Generate official Batch ID (e.g. AYV-2026-00042)
    count = db["batches"].count_documents({}) + 1
    batch_id = f"AYV-2026-{count:05d}"
    
    now_str = datetime.utcnow().isoformat()
    
    # Setup timeline history log
    initial_history = [
        {
            "type": "BATCH_CREATED",
            "actor": current_user["participantId"],
            "date": now_str,
            "location": req.sourceLocation,
            "detail": f"Batch initialized at {req.sourceLocation} by Collector {current_user['name']}."
        }
    ]
    
    batch_doc = {
        "batchId": batch_id,
        "identificationId": req.identificationId,
        "materialId": req.materialId,
        "createdBy": current_user["participantId"],
        "currentOwner": current_user["participantId"],
        "status": "VERIFIED",
        "riskLevel": ident.get("riskLevel", "LOW"),
        "createdAt": now_str,
        "sourceLocation": req.sourceLocation,
        "notes": req.notes,
        "history": initial_history
    }
    
    db["batches"].insert_one(batch_doc)
    batch_doc["_id"] = str(batch_doc["_id"])
    return batch_doc

@app.get("/api/v1/batches")
def get_user_batches(current_user: dict = Depends(get_current_user)):
    # Query batches where user is currently holding the batch
    batches = list(db["batches"].find({"currentOwner": current_user["participantId"]}))
    for b in batches:
        b["_id"] = str(b["_id"])
        # Fetch material details
        mat = db["materials"].find_one({"materialId": b["materialId"]})
        if mat:
            b["material"] = mat["materialName"]
            b["scientificName"] = mat["scientificName"]
    return batches

@app.get("/api/v1/batches/{batchId}")
def get_batch_passport(batchId: str, current_user: dict = Depends(get_current_user)):
    batch = db["batches"].find_one({"batchId": batchId})
    if not batch:
        raise HTTPException(status_code=404, detail="Material batch passport not found.")
        
    batch["_id"] = str(batch["_id"])
    
    # Load associated material and identification data
    mat = db["materials"].find_one({"materialId": batch["materialId"]})
    ident = db["identifications"].find_one({"identificationId": batch["identificationId"]})
    
    return {
        "batchId": batch["batchId"],
        "createdBy": batch["createdBy"],
        "currentOwner": batch["currentOwner"],
        "status": batch["status"],
        "riskLevel": batch["riskLevel"],
        "createdAt": batch["createdAt"],
        "sourceLocation": batch["sourceLocation"],
        "notes": batch["notes"],
        "history": batch["history"],
        "material": {
            "materialId": mat["materialId"] if mat else batch["materialId"],
            "materialName": mat["materialName"] if mat else "Unknown Material",
            "scientificName": mat["scientificName"] if mat else "Unknown Taxonomy"
        } if mat else None,
        "identification": {
            "confidence": ident["confidence"] if ident else 0.9,
            "imageQuality": ident["imageQuality"] if ident else "GOOD"
        } if ident else None
    }

@app.post("/api/v1/batches/{batchId}/verify")
def verify_received_batch(batchId: str, req: BatchVerify, current_user: dict = Depends(get_current_user)):
    batch = db["batches"].find_one({"batchId": batchId})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch passport not found.")
        
    # Check custody
    if batch["currentOwner"] != current_user["participantId"]:
        raise HTTPException(status_code=403, detail="You can only verify batches currently under your custody.")
        
    # Create verification timeline event
    now_str = datetime.utcnow().isoformat()
    verification_event = {
        "type": "BATCH_VERIFIED",
        "actor": current_user["participantId"],
        "date": now_str,
        "location": current_user["location"],
        "detail": f"Physical packaging inspected by {current_user['name']} ({current_user['role']}). Checks - Visual: {req.visualIntegrity}, Weight: {req.weightMatch}, Seals: {req.sealCheck}."
    }
    
    db["batches"].update_one(
        {"batchId": batchId},
        {
            "$push": {"history": verification_event},
            "$set": {"status": "VERIFIED"}
        }
    )
    return {"message": "Physical verification successfully logged.", "status": "VERIFIED"}

# ==========================================
# 5. Participant Directory & Search
# ==========================================
@app.get("/api/v1/participants/search")
def search_participants(q: str, role: str, current_user: dict = Depends(get_current_user)):
    users_collection = db["users"]
    query_filter = {
        "role": role,
        "$or": [
            {"participantId": {"$regex": q, "$options": "i"}},
            {"organizationName": {"$regex": q, "$options": "i"}},
            {"name": {"$regex": q, "$options": "i"}}
        ]
    }
    
    results = users_collection.find(query_filter).limit(10)
    safe_results = []
    for user in results:
        safe_results.append({
            "participantId": user["participantId"],
            "organizationName": user["organizationName"],
            "role": user["role"],
            "location": user["location"]
        })
    return safe_results

# ==========================================
# 6. Supply-Chain Handoff Transfers
# ==========================================
@app.post("/api/v1/batches/{batchId}/transfer")
def transfer_batch_ownership(batchId: str, req: TransferCreate, current_user: dict = Depends(get_current_user)):
    batch = db["batches"].find_one({"batchId": batchId})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch passport not found.")
        
    # Verify ownership
    if batch["currentOwner"] != current_user["participantId"]:
        raise HTTPException(status_code=403, detail={"code": "BATCH_NOT_OWNED", "message": "You do not own this batch."})
        
    # Check if already pending transfer
    if batch["status"] == "TRANSFER_PENDING":
        raise HTTPException(status_code=400, detail={"code": "BATCH_NOT_TRANSFERABLE", "message": "Batch is already in a pending transfer transaction."})
        
    # Verify recipient exists
    recipient = db["users"].find_one({"participantId": req.recipientId})
    if not recipient:
        raise HTTPException(status_code=404, detail={"code": "RECIPIENT_NOT_FOUND", "message": "The selected recipient participant does not exist."})
        
    # Create transfer transaction
    transfer_id = f"TRF-{int(time.time() * 1000) % 100000:05d}"
    now_str = datetime.utcnow().isoformat()
    
    transfer_doc = {
        "transferId": transfer_id,
        "batchId": batchId,
        "senderId": current_user["participantId"],
        "recipientId": req.recipientId,
        "note": req.note,
        "status": "PENDING",
        "createdAt": now_str
    }
    
    # Timeline Handoff update
    timeline_event = {
        "type": "TRANSFER_REQUESTED",
        "actor": current_user["participantId"],
        "date": now_str,
        "location": current_user["location"],
        "detail": f"Transfer initiated to {recipient['organizationName']} ({req.recipientId})."
    }
    
    db["transfers"].insert_one(transfer_doc)
    db["batches"].update_one(
        {"batchId": batchId},
        {
            "$set": {"status": "TRANSFER_PENDING"},
            "$push": {"history": timeline_event}
        }
    )
    
    return {"message": "Handoff transfer request successfully dispatched.", "transferId": transfer_id}

@app.get("/api/v1/transfers/incoming")
def get_incoming_transfers(current_user: dict = Depends(get_current_user)):
    transfers = list(db["transfers"].find({
        "recipientId": current_user["participantId"],
        "status": "PENDING"
    }))
    
    detailed_requests = []
    for t in transfers:
        # Load batch details
        batch = db["batches"].find_one({"batchId": t["batchId"]})
        if batch:
            mat = db["materials"].find_one({"materialId": batch["materialId"]})
            sender = db["users"].find_one({"participantId": t["senderId"]})
            detailed_requests.append({
                "transferId": t["transferId"],
                "batchId": t["batchId"],
                "material": mat["materialName"] if mat else "Unknown Material",
                "scientificName": mat["scientificName"] if mat else "Unknown",
                "fromId": t["senderId"],
                "fromOrg": sender["organizationName"] if sender else "Unknown Organization",
                "confidence": 0.94,
                "riskLevel": batch.get("riskLevel", "LOW"),
                "date": t["createdAt"]
            })
    return detailed_requests

@app.post("/api/v1/transfers/{transferId}/accept")
def accept_handoff_transfer(transferId: str, current_user: dict = Depends(get_current_user)):
    transfer = db["transfers"].find_one({"transferId": transferId})
    if not transfer:
        raise HTTPException(status_code=404, detail="Handoff request transaction not found.")
        
    if transfer["status"] != "PENDING":
        raise HTTPException(status_code=400, detail={"code": "TRANSFER_ALREADY_ACCEPTED", "message": "This transfer is no longer pending."})
        
    if transfer["recipientId"] != current_user["participantId"]:
        raise HTTPException(status_code=403, detail="You do not have permission to accept this handoff.")
        
    now_str = datetime.utcnow().isoformat()
    
    # Update transfer status
    db["transfers"].update_one(
        {"transferId": transferId},
        {"$set": {"status": "ACCEPTED", "completedAt": now_str}}
    )
    
    # Update batch owner
    timeline_event = {
        "type": "TRANSFER_ACCEPTED",
        "actor": current_user["participantId"],
        "date": now_str,
        "location": current_user["location"],
        "detail": f"Handoff accepted by {current_user['organizationName']} ({current_user['participantId']})."
    }
    
    db["batches"].update_one(
        {"batchId": transfer["batchId"]},
        {
            "$set": {
                "currentOwner": current_user["participantId"],
                "status": "VERIFIED"
            },
            "$push": {"history": timeline_event}
        }
    )
    return {"message": "Handoff successfully accepted. Ownership updated.", "status": "VERIFIED"}

@app.post("/api/v1/transfers/{transferId}/reject")
def reject_handoff_transfer(transferId: str, req: TransferReject, current_user: dict = Depends(get_current_user)):
    transfer = db["transfers"].find_one({"transferId": transferId})
    if not transfer:
        raise HTTPException(status_code=404, detail="Handoff request transaction not found.")
        
    if transfer["status"] != "PENDING":
        raise HTTPException(status_code=400, detail="This transfer is no longer pending.")
        
    if transfer["recipientId"] != current_user["participantId"]:
        raise HTTPException(status_code=403, detail="You do not have permission to reject this handoff.")
        
    now_str = datetime.utcnow().isoformat()
    
    # Update transfer status
    db["transfers"].update_one(
        {"transferId": transferId},
        {"$set": {"status": "REJECTED", "completedAt": now_str, "rejectionReason": req.reason}}
    )
    
    # Revert batch to verified state under original owner, log rejection reason
    timeline_event = {
        "type": "TRANSFER_REJECTED",
        "actor": current_user["participantId"],
        "date": now_str,
        "location": current_user["location"],
        "detail": f"Handoff rejected by {current_user['organizationName']}. Reason: {req.reason}"
    }
    
    db["batches"].update_one(
        {"batchId": transfer["batchId"]},
        {
            "$set": {"status": "VERIFIED"},
            "$push": {"history": timeline_event}
        }
    )
    return {"message": "Handoff successfully rejected. Custody remains with sender.", "status": "VERIFIED"}

# ==========================================
# 7. QR / Public Batch Lookup
# ==========================================
@app.get("/api/v1/public/batches/{batchId}")
def get_public_batch_passport(batchId: str):
    batch = db["batches"].find_one({"batchId": batchId})
    if not batch:
        raise HTTPException(status_code=404, detail="Requested batch ID not found on public index ledger.")
        
    # Fetch safe metadata details only (Section 85.3)
    mat = db["materials"].find_one({"materialId": batch["materialId"]})
    
    # Filter timeline events to only show public safe participant information
    public_timeline = []
    for step in batch["history"]:
        public_timeline.append({
            "action": step["type"].replace("_", " ").title(),
            "id": step["actor"],
            "date": step["date"].split("T")[0]
        })
        
    return {
        "batchId": batch["batchId"],
        "materialName": mat["materialName"] if mat else "Unknown Material",
        "scientificName": mat["scientificName"] if mat else "Unknown",
        "riskLevel": batch["riskLevel"],
        "status": batch["status"],
        "currentOwnerId": batch["currentOwner"],
        "timeline": public_timeline
    }

# ==========================================
# 8. Dashboard APIs
# ==========================================
@app.get("/api/v1/dashboard/summary")
def get_dashboard_summary(current_user: dict = Depends(get_current_user)):
    participant_id = current_user["participantId"]
    
    if current_user["role"] == "COLLECTOR":
        total_identifications = db["identifications"].count_documents({"userId": participant_id})
        total_batches = db["batches"].count_documents({"createdBy": participant_id})
        
        # Transfers sent that are pending
        pending_transfers = db["transfers"].count_documents({
            "senderId": participant_id,
            "status": "PENDING"
        })
        
        # Transfers rejected
        rejected_transfers = db["transfers"].count_documents({
            "senderId": participant_id,
            "status": "REJECTED"
        })
        
        return {
            "totalIdentifications": total_identifications,
            "totalBatches": total_batches,
            "pendingTransfers": pending_transfers,
            "rejectedTransfers": rejected_transfers
        }
    else:
        # Wholesaler / Distributor / Manufacturer
        incoming_transfers = db["transfers"].count_documents({
            "recipientId": participant_id,
            "status": "PENDING"
        })
        
        received_batches = db["batches"].count_documents({"currentOwner": participant_id})
        
        pending_verification = db["batches"].count_documents({
            "currentOwner": participant_id,
            "status": "TRANSFER_ACCEPTED" # Handoff finished, pending check
        })
        
        outgoing_transfers = db["transfers"].count_documents({
            "senderId": participant_id,
            "status": "PENDING"
        })
        
        return {
            "incomingTransfers": incoming_transfers,
            "receivedBatches": received_batches,
            "pendingVerification": pending_verification,
            "outgoingTransfers": outgoing_transfers
        }
