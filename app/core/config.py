from pydantic import BaseSettings

class Settings(BaseSettings):
    app_name: str = "FastAPI Cloud Audio Player"

settings = Settings()