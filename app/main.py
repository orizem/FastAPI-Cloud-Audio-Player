from math import ceil

import aiosqlite
from fastapi import FastAPI, Request
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


@app.get("/app")
async def index(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "audio_files": [],
            "page": 1,
            "PAGE_SIZE": PAGE_SIZE,
        },
    )


@app.get("/")
async def home():
    return RedirectResponse(url="/app", status_code=302)


@app.get("/page/{page}")
async def get_page(request: Request, page: int):
    tags = request.query_params.get("tags", default="")

    # sort_order = request.query_params.get('sort_order', default='asc')
    tag_list = tags.split(",") if tags else []
    tags_query = ""

    if tag_list:
        tags_query = f"WHERE subtitles LIKE '%{tag_list[0]}%'"
        for tag in tag_list[1:]:
            tags_query += f" OR subtitles LIKE '%{tag}%'"

    # Connect to SQLite DB (aiosqlite for async support)
    async with aiosqlite.connect(DB_PATH) as conn:
        cursor = await conn.cursor()

        # Count total number of rows (audio files)
        await cursor.execute(f"SELECT COUNT(*) FROM audio_files {tags_query}")
        total_documents = (await cursor.fetchone())[0]

        # Calculate the max page
        MAX_PAGE = max(ceil(total_documents / PAGE_SIZE), 1)

        # Redirect if the page number is out of bounds
        if page > MAX_PAGE:
            return RedirectResponse(url=f"/{MAX_PAGE}", status_code=302)

        # Get the audio file names for the current page
        await cursor.execute(
            f"SELECT filename FROM audio_files {tags_query} LIMIT ? OFFSET ?",
            (PAGE_SIZE, (page - 1) * PAGE_SIZE),
        )
        audio_files = await cursor.fetchall()
    return {"audio_files": audio_files, "page": page, "MAX_PAGE": MAX_PAGE}
