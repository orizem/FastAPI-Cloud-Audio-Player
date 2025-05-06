from math import ceil

import aiosqlite
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.api.routes import audio as audio_router
from app.db import db
from .utils import update_home_page, update_logs_page, get_page_tab_params

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
    page_tab = request.query_params.get("page_tab", default=0)
    page_tab = int(page_tab)
    tag_list = tags.split(",") if tags else []

    page_tab_params = get_page_tab_params(page_tab, verified, tag_list)

    # Determine effective page size
    page_size = int(max_items) if int(max_items.replace("null", "0")) > 0 else PAGE_SIZE
    page_size = min(MAX_ITEMS_LIST, key=lambda x: abs(x - page_size))

    # Tag-driven WHERE logic: subtitles (AND) vs filename (OR)
    if tag_list:
        # filename may match any tag (OR)
        filename_conds = ["filename LIKE ?" for _ in tag_list]
        filename_params = [f"%{tag}%" for tag in tag_list]

        # Combine into one composite clause
        page_tab_params["where_clauses"].append(
            "("
            + page_tab_params["joined_subtitle_conds"]
            + " OR ".join(filename_conds)
            + ")"
        )
        page_tab_params["params"].extend(
            page_tab_params["subtitle_params"] + filename_params
        )

    where_clause = "WHERE " + " AND ".join(page_tab_params["where_clauses"])

    query = f"""
SELECT COUNT(*) 
FROM {page_tab_params['table_name']}
{where_clause if page_tab_params['params'] else ""}"""

    async with aiosqlite.connect(DB_PATH) as conn:
        cursor = await conn.cursor()

        # Total count
        await cursor.execute(query, page_tab_params["params"])
        total_documents = (await cursor.fetchone())[0]

        max_page = max(ceil(total_documents / page_size), 1)
        if page > max_page:
            return RedirectResponse(url=f"/{max_page}", status_code=302)

        # Paginated result
        paginated_params = page_tab_params["params"] + [
            page_size,
            (page - 1) * page_size,
        ]
        await cursor.execute(
            f"""
SELECT tbl.id, tbl.filename{page_tab_params['logs_params']}
FROM ({page_tab_params['table_name']}) AS tbl
{where_clause if page_tab_params['params'] else ""}
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
    if page_tab == 0:
        res = update_home_page(res, audio_files)
    elif page_tab == 1:
        res = update_logs_page(res, audio_files)
    else:
        res = update_home_page(res, audio_files)
    return JSONResponse(res)
