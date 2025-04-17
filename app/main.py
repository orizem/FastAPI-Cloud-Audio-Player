from math import ceil

import aiosqlite
from fastapi import FastAPI
from fastapi.requests import Request
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.api.routes import audio as audio_router

PAGE_SIZE = 5
MAX_PAGE = 1.0
DB_PATH = "audio.db"

app = FastAPI()

app.mount("/static", StaticFiles(directory="app/static"), name="static")
app.include_router(audio_router.router)

templates = Jinja2Templates(directory="app/templates")


@app.get("/")
async def home():
    return RedirectResponse(url="/1", status_code=302)


@app.get("/{page}")
async def next_page(request: Request, page: int):
    # Connect to SQLite DB (aiosqlite for async support)
    async with aiosqlite.connect(DB_PATH) as conn:
        cursor = await conn.cursor()

        # Count total number of rows (audio files)
        await cursor.execute("SELECT COUNT(*) FROM audio_files")
        total_documents = (await cursor.fetchone())[0]

        # Calculate the max page
        MAX_PAGE = max(ceil(total_documents / PAGE_SIZE), 1)

        # Redirect if the page number is out of bounds
        if page > MAX_PAGE:
            return RedirectResponse(url=f"/{MAX_PAGE}", status_code=302)

        # Get the audio file names for the current page
        await cursor.execute(
            "SELECT filename FROM audio_files LIMIT ? OFFSET ?",
            (PAGE_SIZE, (page - 1) * PAGE_SIZE),
        )
        audio_files = await cursor.fetchall()

    # Render the template with the retrieved data
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "audio_files": audio_files,
            "page": page,
            "PAGE_SIZE": PAGE_SIZE,
        },
    )
