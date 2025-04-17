# import os
# # import base64

# from pymongo.mongo_client import MongoClient
# from pymongo.server_api import ServerApi

# import os
# from dotenv import load_dotenv

# load_dotenv()

# uri = os.getenv("MONGO_URI")
# client = MongoClient(uri, server_api=ServerApi("1"))
# db = client["audio_player"]
# collection = db["audio_files"]

# collection.create_index("name")

# collection.delete_many({})

# # _dir = "app/static/audio"
# # for file in os.listdir(_dir):
# #     with open(rf"{_dir}/{file}", "rb") as binary_file:
# #         binary_file_data = binary_file.read()
# #         # base64_encoded_data = base64.b64encode(binary_file_data)

# #         collection.insert_one({"name": file, "audio_data": binary_file_data})
# #         print(file, len(binary_file_data), ", inserted.")
# #         # break


from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from pymongo import InsertOne
from pymongo.errors import BulkWriteError
import os
import base64
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv("MONGO_URI")
client = MongoClient(uri, server_api=ServerApi("1"))
db = client["audio_player"]
collection = db["audio_files"]

# Delete all existing data (for fresh start)
collection.drop_indexes()
collection.delete_many({})

collection.create_index("name", unique=True, background=True)


_dir = "app/static/audio"
requests = []

# Prepare the bulk write requests
for file in os.listdir(_dir):
    with open(rf"{_dir}/{file}", "rb") as binary_file:
        print(f"Reading {file}..")
        binary_file_data = binary_file.read()

        # Encode binary data as base64 to avoid any issues with binary storage
        base64_audio_data = base64.b64encode(binary_file_data).decode('utf-8')

        # Add the insert operation to the bulk request
        requests.append(InsertOne({"name": file, "audio_data": base64_audio_data}))

# Perform the bulk write operation
if requests:
    try:
        result = collection.bulk_write(requests)
        print(f"Inserted {result.inserted_count} documents")
    except BulkWriteError as e:
        print(f"Error during bulk write: {e}")