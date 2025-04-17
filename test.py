from pymongo import MongoClient
import time
import os
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv("MONGO_URI")

start_time = time.time()

client = MongoClient(uri)
db = client["audio_player"]
collection = db["audio_files"]

item = collection.find_one({"name": "GGGGGGG.mp3"})


end_time = time.time()
elapsed = end_time - start_time

hours, rem = divmod(elapsed, 3600)
minutes, seconds = divmod(rem, 60)
milliseconds = (seconds - int(seconds)) * 1000
seconds = int(seconds)

print(
    f"Execution time: {int(hours):02d}:{int(minutes):02d}:{seconds:02d}.{int(milliseconds):03d}"
)
