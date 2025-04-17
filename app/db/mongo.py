# from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

import os
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv("MONGO_URI")
# client = AsyncIOMotorClient(uri, server_api=ServerApi("1"), maxPoolSize=50)
client = MongoClient(uri, server_api=ServerApi("1"))
db = client["audio_player"]
collection = db["audio_files"]
