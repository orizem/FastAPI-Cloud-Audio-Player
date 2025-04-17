from pydantic import BaseModel

class AudioMeta(BaseModel):
    name: str
    # audio_data: str