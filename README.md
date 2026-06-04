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
│   ├── utils/        # Helpers, logger
│   └── server.js     # Express server
├── data/             # SQLite database (gitignored)
├── .gitignore
├── LICENSE.txt
├── README.md
├── package.json
└── package-lock.json
```