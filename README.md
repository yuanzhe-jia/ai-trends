# AI-Trends

Real-time AI trend tracking from tech news.

## Features

- **Keywords**: Trending AI keywords with heat visualization
- **News Feed**: Related articles filtered by keyword
- **Trend History**: 30-day trend chart for each keyword
- **Auto Update**: Daily data refresh at midnight

## Tech Stack

- Frontend: HTML, Tailwind CSS, Chart.js
- Backend: Node.js, Express, SQLite

## Quick Start

```bash
npm install
npm start
# Visit http://localhost:3000
```

## LLM Keyword Extraction (Optional)

The project supports AI-powered keyword extraction using Doubao (豆包) LLM API.

### Setup

1. Get your API key from [Volcengine Console](https://console.volcengine.com/ark)
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Add your API key to `.env`:
   ```
   DOUBAO_API_KEY=your-api-key-here
   ```

If no API key is configured, the system falls back to a predefined keyword library.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/articles | List articles (supports `keyword` filter) |
| GET | /api/trends | Get today's trending keywords |
| GET | /api/trends/:keyword/history | Get keyword history (30 days) |

## Project Structure

```
AI-Trends/
├── src/
│   ├── app/          # Frontend (HTML/CSS/JS)
│   ├── config/       # Configuration
│   ├── controllers/  # Route handlers
│   ├── database/     # DB connection & schema
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── services/     # Business logic (RSS, trends)
│   └── utils/        # Helpers, logger
└── data/             # SQLite database (gitignored)
```