# AI-Trends

AI trend tracking from Chinese tech news sources.

## Features

- **Keywords**: AI-powered keyword extraction with heat visualization
- **News Feed**: Related news filtered by keyword
- **Trend History**: 30-day trend chart for each keyword
- **On-Demand Update**: Data updates automatically when page is accessed

## Tech Stack

- Frontend: HTML, Tailwind CSS, Chart.js
- Backend: Node.js, Express, SQLite

## Quick Start

```bash
npm install
npm start
# Visit http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/articles | List articles (supports `keyword` filter) |
| GET | /api/trends | Get latest trending keywords |
| GET | /api/trends/:keyword/history | Get keyword history (30 days) |
| POST | /api/rss/update | Manually trigger RSS update |

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
│   ├── services/     # Business logic (RSS, trends, LLM)
│   └── utils/        # Helpers, logger
└── data/             # SQLite database (gitignored)
```
