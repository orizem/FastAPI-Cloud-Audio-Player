import base64
from io import BytesIO

from databases import Database
from fastapi import APIRouter, FastAPI
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy import Column, LargeBinary, MetaData, String, Table, create_engine
from sqlalchemy.orm import sessionmaker

from fastapi import Request, Response, HTTPException
from starlette.status import HTTP_206_PARTIAL_CONTENT

# Database URL (with aiosqlite for async SQLite)
DATABASE_URL = "sqlite+aiosqlite:///./audio.db"

# Initialize the database and metadata for SQLAlchemy
database = Database(DATABASE_URL)
metadata = MetaData()

# Define the AudioFiles table using SQLAlchemy
audio_files = Table(
    "audio_files",
    metadata,
    Column("filename", String, primary_key=True),
    Column("content", LargeBinary),
    Column("subtitles", String),
)

# Create FastAPI app
app = FastAPI()

# Define the router for audio routes
router = APIRouter()


# Endpoint to get all audio files
@router.get("/api/audio")
async def get_audio_files():
    query = audio_files.select()  # This should work now
    results = await database.fetch_all(query)
    audio_files_list = [
        {"id": row["filename"], "name": row["filename"]} for row in results
    ]
    return audio_files_list


@router.get("/api/subtitles/{audio_name}")
async def get_subtitles(audio_name: str):
    query = audio_files.select().where(audio_files.c.filename == audio_name)
    result = await database.fetch_one(query)
    
    print("=" * 45)
    print(list(result))

    if not result:
        raise HTTPException(status_code=404, detail="Audio not found")

    return result["subtitles"]


@router.get("/api/audio/{audio_name}")
async def get_audio(audio_name: str, request: Request):
    query = audio_files.select().where(audio_files.c.filename == audio_name)
    result = await database.fetch_one(query)

    if not result:
        raise HTTPException(status_code=404, detail="Audio not found")

    file_size = len(result["content"])
    range_header = request.headers.get("range")

    if range_header:
        # Parse the range header
        bytes_unit, byte_range = range_header.strip().split("=")
        if bytes_unit != "bytes":
            raise HTTPException(status_code=416, detail="Invalid range unit")

        start_str, end_str = byte_range.split("-")
        start = int(start_str)
        end = int(end_str) if end_str else file_size - 1
        end = min(end, file_size - 1)

        if start > end or start >= file_size:
            raise HTTPException(
                status_code=416, detail="Requested range not satisfiable"
            )

        # Stream the requested part of the file
        chunk = result["content"][start : end + 1]
        content_length = len(chunk)
        content_range = f"bytes {start}-{end}/{file_size}"

        return Response(
            content=chunk,
            status_code=HTTP_206_PARTIAL_CONTENT,
            headers={
                "Content-Range": content_range,
                "Accept-Ranges": "bytes",
                "Content-Length": str(content_length),
                "Content-Type": "audio/mpeg",
            },
        )
    else:
        # If no range is specified, send the whole file
        return Response(
            content=result["content"],
            status_code=200,
            headers={"Content-Type": "audio/mpeg"},
        )


# Include the audio router in the FastAPI app
app.include_router(router)
