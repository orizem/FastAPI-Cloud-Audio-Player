import os
import sqlite3

conn = sqlite3.connect("audio.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS audio_files (
    filename TEXT PRIMARY KEY,
    content BLOB
)
""")
conn.commit()

_dir = r"D:\New folder\Python Cloud Music Player\app\static\audio"
for filename in os.listdir(_dir):
    with open(fr"{_dir}\{filename}", "rb") as f:
        content = f.read()

    cursor.execute("INSERT OR REPLACE INTO audio_files (filename, content) VALUES (?, ?)", (filename, content))
conn.commit()
conn.close()
