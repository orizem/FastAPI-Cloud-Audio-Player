PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS audio_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT UNIQUE,
    content BLOB,
    subtitles TEXT,
    verified INTEGER
);

CREATE TABLE IF NOT EXISTS audio_files_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    audio_file_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    column_changed TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(audio_file_id)
      REFERENCES audio_files(id)
      DEFERRABLE INITIALLY DEFERRED
);

DROP TRIGGER IF EXISTS trg_audio_files_insert;
CREATE TRIGGER trg_audio_files_insert
AFTER INSERT ON audio_files
BEGIN
    INSERT INTO audio_files_history (audio_file_id, action, column_changed)
    VALUES (NEW.id, 'INSERT', NULL);
END;

DROP TRIGGER IF EXISTS trg_audio_files_delete;
CREATE TRIGGER trg_audio_files_delete
AFTER DELETE ON audio_files
BEGIN
    INSERT INTO audio_files_history (audio_file_id, action, column_changed)
    VALUES (OLD.id, 'DELETE', NULL);
END;

DROP TRIGGER IF EXISTS trg_audio_files_update_verified;
CREATE TRIGGER trg_audio_files_update_verified
AFTER UPDATE OF verified ON audio_files
WHEN OLD.verified IS NOT NEW.verified
BEGIN
    INSERT INTO audio_files_history (audio_file_id, action, column_changed)
    VALUES (NEW.id, 'UPDATE', 'verified');
END;
