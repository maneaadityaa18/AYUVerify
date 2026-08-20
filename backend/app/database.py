import pymongo
from datetime import datetime
from .config import settings
from .security import hash_password

client = pymongo.MongoClient(settings.MONGODB_URI)
db = client[settings.DATABASE_NAME]

def seed_database():
    """
    Seeds initial botanical knowledge records and default supply-chain test users
    into the database idempotently.
    """
    materials_collection = db["materials"]
    
    # Ensure only MAT-001 and MAT-002 exist in database (delete others)
    materials_collection.delete_many({"materialId": {"$nin": ["MAT-001", "MAT-002"]}})
    
    default_materials = [
        {
            "materialId": "MAT-001",
            "materialName": "Aloevera",
            "scientificName": "Aloe barbadensis miller",
            "materialType": "LEAF",
            "commonNames": ["Aloe Vera", "Ghritkumari"],
            "commonAdulterants": ["Water dilution", "Generic gel fillers"],
            "morphologicalFeatures": ["Thick fleshy green leaves", "Spiny margins", "Clear inner gel"],
            "description": "Fleshy leaf plant widely utilized for skincare, wound healing, and digestive health."
        },
        {
            "materialId": "MAT-002",
            "materialName": "Amla",
            "scientificName": "Phyllanthus emblica",
            "materialType": "FRUIT",
            "commonNames": ["Amla", "Indian Gooseberry", "Amalaki"],
            "commonAdulterants": ["Generic wild berries", "Waterlogged low-quality fruits"],
            "morphologicalFeatures": ["Round light greenish-yellow fruits", "6 vertical stripes", "Hard seed inside"],
            "description": "Rich source of Vitamin C, widely used in Ayurvedic formulations like Chyawanprash for rejuvenation."
        }
    ]
    
    for mat in default_materials:
        # If it exists, update it to make sure it matches our seeded data, otherwise insert
        existing = materials_collection.find_one({"materialId": mat["materialId"]})
        if not existing:
            materials_collection.insert_one(mat)
            print(f"[Database Seeding]: Successfully seeded {mat['materialName']}.")
        else:
            materials_collection.replace_one({"materialId": mat["materialId"]}, mat)
            print(f"[Database Seeding]: Successfully updated {mat['materialName']}.")

    # Seed default role test users idempotently
    users_collection = db["users"]
    default_users = [
        {
            "participantId": "COL-0001",
            "name": "Ramesh Kumar",
            "email": "collector@ayurverify.com",
            "password": "Password123!",
            "role": "COLLECTOR",
            "organizationName": "Green Harvest Organics",
            "location": "Patan, Gujarat"
        },
        {
            "participantId": "WHO-0001",
            "name": "Suresh Patel",
            "email": "wholesaler@ayurverify.com",
            "password": "Password123!",
            "role": "WHOLESALER",
            "organizationName": "Apex Herbal Wholesalers",
            "location": "Ahmedabad, Gujarat"
        },
        {
            "participantId": "DIS-0001",
            "name": "Vikram Singh",
            "email": "distributor@ayurverify.com",
            "password": "Password123!",
            "role": "DISTRIBUTOR",
            "organizationName": "National Logistics & Supply",
            "location": "Mumbai, Maharashtra"
        },
        {
            "participantId": "MAN-0001",
            "name": "Ananya Sharma",
            "email": "manufacturer@ayurverify.com",
            "password": "Password123!",
            "role": "MANUFACTURER",
            "organizationName": "AyurPharma Industries",
            "location": "Haridwar, Uttarakhand"
        },
        {
            "participantId": "EXP-0001",
            "name": "Dr. V. K. Shastri",
            "email": "expert@ayurverify.com",
            "password": "Password123!",
            "role": "EXPERT",
            "organizationName": "Central Botanical Research Inst",
            "location": "New Delhi"
        }
    ]

    for u in default_users:
        existing = users_collection.find_one({"email": u["email"]})
        if not existing:
            user_doc = {
                "participantId": u["participantId"],
                "name": u["name"],
                "email": u["email"],
                "hashedPassword": hash_password(u["password"]),
                "role": u["role"],
                "organizationName": u["organizationName"],
                "location": u["location"],
                "createdAt": datetime.utcnow().isoformat()
            }
            users_collection.insert_one(user_doc)
            print(f"[Database Seeding]: Created test user {u['email']} ({u['role']}).")

