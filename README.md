# FastAPI Cloud Audio Player

## Overview

FastAPI Cloud Audio Player is a cloud-native audio streaming service built with Python 3.13.0 and FastAPI. Engineered for scalability and low-latency delivery.

## Key Features

- **Cloud-Native Architecture**: Designed to run on sqlite.
- **High-Performance Streaming**: Utilizes FastAPI with Uvicorn for asynchronous I/O, delivering non-blocking audio streams.
- **WebSocket Playback**: Real-time audio streaming via WebSocket endpoints for synchronized client playback.

## Prerequisites

- Python 3.13.0
- `ffmpeg` (for on-the-fly audio transcoding, optional but recommended)
- Git client

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/orizem/FastAPI-Cloud-Audio-Player.git
   cd FastAPI-Cloud-Audio-Player
   ```

2. **Create a virtual environment**

   ```bash
   python3.13 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize the database** (optional)

   ```bash
   sqlite3 audio.db < app/schema.sql
   ```

## Configuration

All runtime parameters are controlled via environment variables. Create a `.env` file at the project root with the following keys:

```ini
# Server settings
HOST=0.0.0.0
PORT=8000

# Database settings
DB_PATH=audio.db
```

## Usage

1. **Start the application**

   ```bash
   uvicorn app.main:app --host $HOST --port $PORT --reload
   ```

2. **List available audio files**

   ```bash
   curl http://localhost:8000/
   ```

3. **Stream audio via WebSocket**
   Connect to `ws://localhost:8000/api/audio/{audio_id}` with your WebSocket client to receive byte chunks for playback.

## Deployment

- **Docker**: Build and push your container image for cloud deployment.

## License

This project is released under the MIT License. See [LICENSE](LICENSE) for details.

---

_© 2025 FastAPI Cloud Audio Player Contributors_
