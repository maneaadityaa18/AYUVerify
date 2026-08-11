import pymongo
from .config import settings

client = pymongo.MongoClient(settings.MONGODB_URI)
db = client[settings.DATABASE_NAME]

def seed_database():
    """
    Seeds initial botanical knowledge records into the materials collection
    idempotently.
    """
    materials_collection = db["materials"]
    
    default_materials = [
        {
            "materialId": "MAT-001",
            "materialName": "Ashwagandha Root",
            "scientificName": "Withania somnifera",
            "materialType": "ROOT",
            "commonNames": ["Ashwagandha", "Indian Ginseng", "Winter Cherry"],
            "commonAdulterants": ["Withania coagulans", "Dry potato starch"],
            "morphologicalFeatures": ["Stout roots", "Fleshy and whitish-brown tubers"],
            "description": "Highly prized Ayurvedic adaptogenic root used to enhance vitality and reduce stress."
        },
        {
            "materialId": "MAT-002",
            "materialName": "Tulsi Leaves",
            "scientificName": "Ocimum sanctum",
            "materialType": "LEAF",
            "commonNames": ["Tulsi", "Holy Basil"],
            "commonAdulterants": ["Ocimum basilicum (Sweet Basil)"],
            "morphologicalFeatures": ["Highly aromatic", "Serrated purple or green leaves"],
            "description": "Sacred herb in India, widely used in teas and remedies for respiratory health and immunity."
        },
        {
            "materialId": "MAT-003",
            "materialName": "Turmeric Powder",
            "scientificName": "Curcuma longa",
            "materialType": "POWDER",
            "commonNames": ["Turmeric", "Haldi"],
            "commonAdulterants": ["Metanil yellow dye", "Lead chromate", "Starch flour"],
            "morphologicalFeatures": ["Vibrant yellow-orange powder", "Aromatic earthy scent"],
            "description": "Golden spice used globally for its powerful anti-inflammatory and antiseptic curcumin compounds."
        },
        {
            "materialId": "MAT-004",
            "materialName": "Aloevera",
            "scientificName": "Aloe barbadensis miller",
            "materialType": "LEAF",
            "commonNames": ["Aloe Vera", "Ghritkumari"],
            "commonAdulterants": ["Water dilution", "Generic gel fillers"],
            "morphologicalFeatures": ["Thick fleshy green leaves", "Spiny margins", "Clear inner gel"],
            "description": "Fleshy leaf plant widely utilized for skincare, wound healing, and digestive health."
        },
        {
            "materialId": "MAT-005",
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
        if materials_collection.count_documents({"materialId": mat["materialId"]}) == 0:
            materials_collection.insert_one(mat)
            print(f"[Database Seeding]: Successfully seeded {mat['materialName']}.")
        else:
            print(f"[Database Seeding]: {mat['materialName']} already exists. Skipping.")
