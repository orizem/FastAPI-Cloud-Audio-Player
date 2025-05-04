import os
import sqlite3
from pathlib import Path

conn = sqlite3.connect("audio.db")
cursor = conn.cursor()

conn.execute("PRAGMA foreign_keys = ON")
schema_path = Path(__file__).parent / "schema.sql"

sql = (Path(__file__).parent / "schema.sql").read_text(encoding="utf-8")
conn.executescript(sql)
conn.commit()



def upload():
    audio_items = {}
    _dir = r"D:\New folder\Python Cloud Music Player\app\static\audio"

    # Gather .mp3 files
    for fn in os.listdir(_dir):
        if not fn.lower().endswith(".mp3"):
            continue
        path = os.path.join(_dir, fn)
        with open(path, "rb") as f:
            audio_items[fn[:-4]] = {
                "filename": fn,
                "content": f.read(),
                "subtitles": "",
                "verified": 0,
            }

    # Attach .txt subtitles
    for fn in os.listdir(_dir):
        if not fn.lower().endswith(".txt"):
            continue
        key = fn[:-4]
        if key in audio_items:
            with open(os.path.join(_dir, fn), encoding="utf-8") as f:
                audio_items[key]["subtitles"] = f.read()

    try:
        conn.execute("BEGIN")  # start transaction
        for item in audio_items.values():
            # 1) Try insert (won't delete existing row)
            cursor.execute(
                "INSERT OR IGNORE INTO audio_files (filename, content, subtitles, verified) VALUES (?, ?, ?, ?)",
                (item["filename"], item["content"], item["subtitles"], item["verified"]),
            )
            # 2) Always update with new payload
            cursor.execute(
                "UPDATE audio_files SET content = ?, subtitles = ?, verified = ? WHERE filename = ?",
                (item["content"], item["subtitles"], item["verified"], item["filename"]),
            )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise RuntimeError(f"Database insert failed: {e}")
    finally:
        conn.close()


