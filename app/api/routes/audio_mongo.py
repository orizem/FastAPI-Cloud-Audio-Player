import base64
from io import BytesIO

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.db.mongo import collection
import time

router = APIRouter()
CHUNK_SIZE = 1024 * 64  # 64KB

@router.get("/api/audio")
# async def get_audio_files():
def get_audio_files():
    cursor = collection.find({})
    audio_files = []
    # async for doc in cursor:
    for doc in cursor:
        audio_files.append({
            "id": str(doc["_id"]),
            "name": doc.get("name", ""),
            "has_audio_data":  doc["audio_data"]
        })
    return audio_files


@router.get("/api/audio/{audio_name}")
# async def get_audio(audio_name: str):
def get_audio(audio_name: str):
    print(f"________: {audio_name}")
    # audio = await collection.find_one({"name": audio_name}, {"audio_data": 1})
    # cursor = collection.find({"name": audio_name}, {"audio_data": 1})
    # audio = await cursor.next()
    start_time = time.time()
    # audio_cursor = collection.find({"name": audio_name}, {"audio_data": 1})
    audio = collection.find_one({"name": audio_name})
    end_time = time.time()
    elapsed = end_time - start_time

    hours, rem = divmod(elapsed, 3600)
    minutes, seconds = divmod(rem, 60)
    milliseconds = (seconds - int(seconds)) * 1000
    seconds = int(seconds)

    print(f"Execution time: {int(hours):02d}:{int(minutes):02d}:{seconds:02d}.{int(milliseconds):03d}")
    start_time = time.time()
    
    
    # audio = await audio_cursor.to_list(length=1)
    # audio = audio_cursor.to_list(length=1)

    if audio and "audio_data" in audio:
        decoded_audio = base64.b64decode(audio["audio_data"])#.decode("utf-8")
        end_time = time.time()
        elapsed = end_time - start_time

        hours, rem = divmod(elapsed, 3600)
        minutes, seconds = divmod(rem, 60)
        milliseconds = (seconds - int(seconds)) * 1000
        seconds = int(seconds)

        print(f"Execution time: {int(hours):02d}:{int(minutes):02d}:{seconds:02d}.{int(milliseconds):03d}")
        # return {"msg": decoded_audio}
        # decoded_audio = base64.b64decode(audio["audio_data"])
        return StreamingResponse(BytesIO(decoded_audio), media_type="audio/mpeg")

    return {"error": "Audio not found"}, 404

# @router.get("/api/audio/{audio_name}")
# async def get_audio(audio_name: str):
#     audio = await collection.find_one({"name": audio_name})

#     if not audio or "audio_data" not in audio:
#         return {"error": "Audio not found"}, 404

#     audio_data = audio["audio_data"]

#     async def audio_stream():
#         for i in range(0, len(audio_data), CHUNK_SIZE):
#             yield audio_data[i:i + CHUNK_SIZE]

#     return StreamingResponse(audio_stream(), media_type="audio/mpeg")
