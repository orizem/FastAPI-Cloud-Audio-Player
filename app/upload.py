import os
import sqlite3

conn = sqlite3.connect("audio.db")
cursor = conn.cursor()

cursor.execute(
    """
CREATE TABLE IF NOT EXISTS audio_files (
    filename TEXT PRIMARY KEY,
    content BLOB,
    subtitles TEXT,
    verified INTEGER
)
"""
)
conn.commit()

audio_items = {}

_dir = r"D:\New folder\Python Cloud Music Player\app\static\audio"
for filename in [f for f in os.listdir(_dir) if f.endswith(".mp3")]:
    with open(rf"{_dir}\{filename}", "rb") as f:
        content = f.read()
        audio_items[filename.replace(".mp3", "")] = {
            "filename": filename,
            "content": content,
            "subtitles": "",
            "verified": 0,
        }

for filename in [f for f in os.listdir(_dir) if f.endswith(".txt")]:
    with open(rf"{_dir}\{filename}", encoding="utf-8") as f:
        subtitles = f.read()
        audio_items[filename.replace(".txt", "")]["subtitles"] = subtitles


for audio_key in audio_items.keys():
    filename = audio_items[audio_key]["filename"]
    content = audio_items[audio_key]["content"]
    subtitles = audio_items[audio_key]["subtitles"]

    cursor.execute(
        "INSERT OR REPLACE INTO audio_files (filename, content, subtitles, verified) VALUES (?, ?, ?, ?)",
        (filename, content, subtitles, 0),
    )
conn.commit()
conn.close()
