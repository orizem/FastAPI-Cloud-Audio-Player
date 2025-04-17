from pydantic import BaseSettings

class Settings(BaseSettings):
    app_name: str = "FastAPI Audio App"

settings = Settings()