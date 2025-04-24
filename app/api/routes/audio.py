import os

from databases import Database
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException, Request, Response
from sqlalchemy import (
    Column,
    Integer,
    LargeBinary,
    MetaData,
    String,
    Table,
)
from starlette.status import HTTP_206_PARTIAL_CONTENT

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Initialize the database and metadata for SQLAlchemy
database = Database(DATABASE_URL)
metadata = MetaData()

# Define the AudioFiles table using SQLAlchemy
audio_files = Table(
    "audio_files",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("filename", String, unique=True),
    Column("content", LargeBinary),
    Column("subtitles", String),
    Column("verified", Integer),
)

# Create FastAPI app
app = FastAPI()

# Define the router for audio routes
router = APIRouter()


# Endpoint to get all audio files
@router.get("/api/audio")
async def get_audio_files():
    query = audio_files.select()
    results = await database.fetch_all(query)
    audio_files_list = [{"id": row["id"], "name": row["filename"]} for row in results]
    return audio_files_list


@router.get("/api/subtitles/{audio_id}")
async def get_subtitles(audio_id: int):
    query = audio_files.select().where(audio_files.c.id == audio_id)
    result = await database.fetch_one(query)

    if not result:
        raise HTTPException(status_code=404, detail="Subtitles not found")

    return result["subtitles"]


@router.get("/api/verified/{audio_id}")
async def get_verified(audio_id: int):
    query = audio_files.select().where(audio_files.c.id == audio_id)
    result = await database.fetch_one(query)

    if not result:
        raise HTTPException(status_code=404, detail="Verified not found")

    return result["verified"]


@router.post("/api/verify/{audio_id}")
async def post_verify(audio_id: int):
    query = audio_files.select().where(audio_files.c.id == audio_id)
    result = await database.fetch_one(query)

    if not result:
        raise HTTPException(status_code=404, detail="Verified not found")

    update_query = (
        audio_files.update().where(audio_files.c.id == audio_id).values(verified=1)
    )
    await database.execute(update_query)


@router.get("/api/audio/{audio_id}")
async def get_audio(audio_id: int, request: Request):
    query = audio_files.select().where(audio_files.c.id == audio_id)
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
