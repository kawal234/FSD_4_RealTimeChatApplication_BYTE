# Real-Time Chat Application

A high-performance, real-time chat application featuring a modern, ChatGPT-style dark mode interface. Built with a full-duplex WebSocket architecture on FastAPI and a reactive React frontend, this application ensures instant message broadcasting and persistent chat history.

## Features
- **Real-Time WebSockets**: Instant, sub-millisecond bidirectional communication utilizing FastAPI's async event loop.
- **Persistent Chat History**: Relational data storage using SQLite (default) or PostgreSQL, automatically recovering chat context on reconnect.
- **Isolated Room Multiplexing**: Discrete connection management ensures broadcasts stay strictly within their designated channels.
- **Modern UI/UX**: Premium dark-mode aesthetic inspired by leading AI interfaces, complete with collapsible sidebars, floating input pills, and distinct sender avatars.

## Tech Stack
- **Backend**: Python, FastAPI, Uvicorn, SQLAlchemy, WebSockets
- **Frontend**: React, Vite, Vanilla CSS
- **Database**: SQLite (Local Dev) / PostgreSQL (Production)

## Quick Start

### 1. Backend Setup
Navigate to the project root and start the FastAPI server:
```bash
# Create and activate virtual environment
python3 -m venv backend/venv
source backend/venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Start the server
uvicorn backend.main:app --reload --port 8000
```
*Note: This will automatically generate a local `chat.db` SQLite database.*

### 2. Frontend Setup
In a new terminal window, initialize the Vite React app:
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 3. Usage
- Open your browser and navigate to `http://localhost:5173`.
- Enter your **Engineer Name** and the **Workspace** (e.g., `agent-dev`).
- Start chatting! Open multiple windows in the same workspace to see live broadcasting in action.

## Deployment Notes
- **Database**: For production, override the default SQLite by setting the `DATABASE_URL` environment variable to a valid PostgreSQL connection string.
- **WebSocket Sessions**: The backend properly manages SQLAlchemy sessions discretely for each WebSocket event loop, preventing long-running transaction locks.
- **Host Consistency**: If testing across different devices on a local network, ensure the `ws://localhost:8000` string in `App.jsx` is updated to your machine's local IP (e.g., `ws://192.168.x.x:8000`).
