# AI-Trends

AI trend tracking from Chinese tech news sources.

## Features

- **Keyword Heatmap** - Visualize trending AI topics with heat visualization
- **News Aggregation** - Automatically fetch RSS feeds from 8 Chinese tech media sources
- **Trend History** - 30-day trend charts to track topic popularity changes
- **Lightweight Storage** - SQLite database with zero configuration

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, Tailwind CSS, Chart.js |
| Backend | Node.js, Express |
| Database | SQLite |

## Quick Start

```bash
# Install dependencies
npm install
```

```bash
# Start server
# Visit http://localhost:3000 to view the application
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/articles` | Get article list (supports keyword filter) |
| GET | `/api/trends` | Get latest trending keywords |
| GET | `/api/trends/:keyword/history` | Get keyword history (30 days) |
| POST | `/api/rss/update` | Manually trigger RSS update |
| POST | `/api/trends/update` | Manually update trend data |
| GET | `/api/trends/check-update` | Check if update is needed |

## Project Structure

```
ai-trends/
├── src/
│   ├── frontend/           # Frontend code
│   │   ├── index.html      # Page structure
│   │   └── app.js          # Frontend logic
│   └── backend/            # Backend code
│       ├── config/         # Configuration files
│       ├── controllers/    # Route controllers
│       ├── database/       # Database connection
│       ├── models/         # Data models
│       ├── routes/         # API routes
│       ├── services/       # Business logic
│       ├── utils/          # Utility functions
│       └── server.js       # Entry point
├── data/                   # SQLite database
├── package.json
└── README.md
```
