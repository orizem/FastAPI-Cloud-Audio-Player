from math import ceil

import aiosqlite
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.api.routes import audio as audio_router

PAGE_SIZE = 5
DB_PATH = "audio.db"
MAX_ITEMS_LIST = [5, 10, 25, 50, 100]

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
            "MAX_ITEMS_LIST": MAX_ITEMS_LIST,
        },
    )


@app.get("/")
async def home():
    return RedirectResponse(url="/app", status_code=302)


@app.get("/page/{page}")
async def get_page(request: Request, page: int):
    tags = request.query_params.get("tags", default="")
    verified = request.query_params.get("verified", default=0)
    max_items = request.query_params.get("max_items", default=0)
    tag_list = tags.split(",") if tags else []

    where_clauses = ["verified = ?"]
    params = [verified]
    page_size = int(max_items) if int(max_items.replace("null", "0")) > 0 else PAGE_SIZE

    # Floor page size to feet list values
    page_size = min(MAX_ITEMS_LIST, key=lambda x: abs(x - page_size))

    if tag_list:
        tag_conditions = []
        for tag in tag_list:
            tag_conditions.append("subtitles LIKE ?")
            params.append(f"%{tag}%")
        where_clauses.append(f"({' AND '.join(tag_conditions)})")

    where_clause = "WHERE " + " AND ".join(where_clauses)

    async with aiosqlite.connect(DB_PATH) as conn:
        cursor = await conn.cursor()

        # Total count
        await cursor.execute(f"SELECT COUNT(*) FROM audio_files {where_clause}", params)
        total_documents = (await cursor.fetchone())[0]

        max_page = max(ceil(total_documents / page_size), 1)
        if page > max_page:
            return RedirectResponse(url=f"/{max_page}", status_code=302)

        # Paginated result
        paginated_params = params + [page_size, (page - 1) * page_size]
        await cursor.execute(
            f"SELECT id, filename FROM audio_files {where_clause} LIMIT ? OFFSET ?",
            paginated_params,
        )
        audio_files = await cursor.fetchall()

    return JSONResponse(
        {
            "audio_files": [{"id": row[0], "filename": row[1]} for row in audio_files],
            "page": page,
            "MAX_PAGE": max_page,
            "total_documents": total_documents,
        }
    )
