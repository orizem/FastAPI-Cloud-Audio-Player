from math import ceil

import aiosqlite
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.api.routes import audio as audio_router
from app.db import db

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


@app.get("/upload")
async def upload():
    db.upload()
    return {"msg": "Audio and text data has been uploaded to db."}


@app.get("/page/{page}")
async def get_page(request: Request, page: int):
    tags = request.query_params.get("tags", default="")
    verified = request.query_params.get("verified", default=0)
    max_items = request.query_params.get("max_items", default=0)
    is_logs = request.query_params.get("is_logs", default=0)
    tag_list = tags.split(",") if tags else []

    logs_params = ""
    where_clause = ""
    where_clauses = []
    params = []
    table_name = "audio_files"

    if int(is_logs) == 0:
        where_clauses.append("verified = ?")
        params.append(verified)
    else:
        table_name = "audio_files_history JOIN audio_files ON audio_files.id = audio_files_history.audio_file_id"
        logs_params = ", verified, audio_file_id, action, column_changed, timestamp"

    # Determine effective page size
    page_size = int(max_items) if int(max_items.replace("null", "0")) > 0 else PAGE_SIZE
    page_size = min(MAX_ITEMS_LIST, key=lambda x: abs(x - page_size))

    # Tag-driven WHERE logic: subtitles (AND) vs filename (OR)
    if tag_list:
        # subtitles must match all tags (AND)
        subtitle_conds = []
        subtitle_params = []
        if int(is_logs) == 0:
            subtitle_conds = ["subtitles LIKE ?" for _ in tag_list]
            subtitle_params = [f"%{tag}%" for tag in tag_list]

        # filename may match any tag (OR)
        filename_conds = ["filename LIKE ?" for _ in tag_list]
        filename_params = [f"%{tag}%" for tag in tag_list]

        # Combine into one composite clause
        where_clauses.append(
            "("
            + (" AND ".join(subtitle_conds) + " OR " if int(is_logs) == 0 else "")
            + " OR ".join(filename_conds)
            + ")"
        )
        params.extend(subtitle_params + filename_params)

    # if int(is_logs) == 0:
    where_clause = "WHERE " + " AND ".join(where_clauses)

    query = f"""
SELECT COUNT(*) 
FROM {table_name}
{where_clause if params else ""}"""

    async with aiosqlite.connect(DB_PATH) as conn:
        cursor = await conn.cursor()

        # Total count
        await cursor.execute(query, params)
        total_documents = (await cursor.fetchone())[0]

        max_page = max(ceil(total_documents / page_size), 1)
        if page > max_page:
            return RedirectResponse(url=f"/{max_page}", status_code=302)

        # Paginated result
        paginated_params = params + [page_size, (page - 1) * page_size]
        await cursor.execute(
            f"""
SELECT audio_files.id, audio_files.filename{logs_params}
FROM {table_name}
{where_clause if params else ""}
LIMIT ? OFFSET ?
""",
            paginated_params,
        )
        audio_files = await cursor.fetchall()

    res = {
        "page": page,
        "MAX_PAGE": max_page,
        "total_documents": total_documents,
    }
    if int(is_logs) == 0:
        res.update(
            {"audio_files": [{"id": row[0], "filename": row[1]} for row in audio_files]}
        )
    else:
        res.update(
            {
                "audio_files": [
                    {
                        "id": row[0],
                        "filename": row[1],
                        "verified": row[2],
                        "audio_file_id": row[3],
                        "action": row[4],
                        "column_changed": row[5],
                        "timestamp": row[6],
                    }
                    for row in audio_files
                ]
            }
        )
    return JSONResponse(res)
