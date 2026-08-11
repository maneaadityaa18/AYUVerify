import os
from dotenv import load_dotenv

# Path to the .env file in the backend root
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(env_path)

class Settings:
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "ayurverify")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))

settings = Settings()
