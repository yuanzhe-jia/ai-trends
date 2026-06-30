# AI-Trends

AI trends tracking from Chinese tech resources.

## Features

- **Keyword Heatmap** - Visualize trending AI topics with heat visualization
- **News Aggregation** - Automatically fetch RSS feeds from Chinese tech media sources
- **Trend History** - 30-day trend charts to track topic popularity changes
- **Scheduled Updates** - Daily automatic updates at 3:00 AM (UTC+8)
- **Lightweight Storage** - SQLite database with zero configuration
- **Production-Ready** - PM2 + systemd for reliable deployment

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, Tailwind CSS, Chart.js |
| Backend | Node.js, Express |
| Database | SQLite |
| Scheduler | node-schedule |
| Process Manager | PM2 |

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
│       ├── services/       # Business logic (RSS, scheduler, trends)
│       ├── utils/          # Utility functions (logger)
│       └── server.js       # Entry point
├── data/                   # SQLite database (ignored by git)
├── logs/                   # Log files (ignored by git)
├── .env                    # Environment variables
├── ecosystem.config.js     # PM2 configuration
├── setup.sh                # Server initialization script (auto-generates systemd service)
├── deploy.sh               # Deployment/update script
├── package.json
└── README.md
```
