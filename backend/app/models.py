from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: str = Field(..., pattern="^(COLLECTOR|WHOLESALER|DISTRIBUTOR|MANUFACTURER|EXPERT|ADMIN)$")
    organizationName: str = Field(..., min_length=2)
    location: str = Field(..., min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    participantId: str
    name: str
    email: EmailStr
    role: str
    organizationName: str
    location: str

class TokenResponse(BaseModel):
    accessToken: str
    tokenType: str
    user: UserResponse

class BatchCreate(BaseModel):
    identificationId: str
    materialId: str
    sourceLocation: str
    notes: Optional[str] = ""

class BatchVerify(BaseModel):
    visualIntegrity: bool
    weightMatch: bool
    sealCheck: bool
    comments: Optional[str] = ""

class IssueReport(BaseModel):
    reason: str = Field(..., min_length=2, max_length=100)
    description: str = Field(..., min_length=5, max_length=1000)

class ExpertDecision(BaseModel):
    decision: str = Field(..., pattern="^(APPROVE|REJECT)$")
    notes: Optional[str] = ""

class TransferCreate(BaseModel):
    recipientId: str
    note: Optional[str] = ""

class TransferReject(BaseModel):
    reason: str = Field(..., min_length=5, max_length=500)
