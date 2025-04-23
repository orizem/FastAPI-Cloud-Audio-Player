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
    verified = request.query_params.get("verified", default=0)
    tag_list = tags.split(",") if tags else []

    where_clauses = ["verified = ?"]
    params = [verified]

    if tag_list:
        tag_conditions = []
        for tag in tag_list:
            tag_conditions.append("subtitles LIKE ?")
            params.append(f"%{tag}%")
        where_clauses.append(f"({' OR '.join(tag_conditions)})")

    where_clause = "WHERE " + " AND ".join(where_clauses)

    async with aiosqlite.connect(DB_PATH) as conn:
        cursor = await conn.cursor()

        # Total count
        await cursor.execute(f"SELECT COUNT(*) FROM audio_files {where_clause}", params)
        total_documents = (await cursor.fetchone())[0]

        MAX_PAGE = max(ceil(total_documents / PAGE_SIZE), 1)
        if page > MAX_PAGE:
            return RedirectResponse(url=f"/{MAX_PAGE}", status_code=302)

        # Paginated result
        paginated_params = params + [PAGE_SIZE, (page - 1) * PAGE_SIZE]
        await cursor.execute(
            f"SELECT filename FROM audio_files {where_clause} LIMIT ? OFFSET ?", paginated_params
        )
        audio_files = await cursor.fetchall()

    return {"audio_files": audio_files, "page": page, "MAX_PAGE": MAX_PAGE}

