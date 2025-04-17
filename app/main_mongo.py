from math import ceil

from fastapi import FastAPI
from fastapi.requests import Request
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.api.routes import audio as audio_router
from app.db.mongo import collection

PAGE_SIZE = 5
MAX_PAGE = 1.0

app = FastAPI()

app.mount("/static", StaticFiles(directory="app/static"), name="static")
app.include_router(audio_router.router)

templates = Jinja2Templates(directory="app/templates")


@app.get("/")
# async def home():
def home():
    return RedirectResponse(url="/1", status_code=302)


@app.get("/{page}")
# async def next_page(request: Request, page: int):
def next_page(request: Request, page: int):
    # total_documents = await collection.count_documents({})
    total_documents = collection.count_documents({})
    MAX_PAGE = max(ceil(total_documents / PAGE_SIZE), 1)

    if page > MAX_PAGE:
        return RedirectResponse(url=f"/{MAX_PAGE}", status_code=302)
    
    cursor = collection.find({}, {"name": 1}).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE)
    # audio_files = await cursor.to_list(length=PAGE_SIZE)
    audio_files = cursor.to_list(length=PAGE_SIZE)

    return templates.TemplateResponse(
        "index.html",
        {"request": request, "audio_files": audio_files, "page": page, "PAGE_SIZE": PAGE_SIZE},
    )
