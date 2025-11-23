# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

News aggregation monorepo with a Node.js/Express backend and two React frontends (consumer viewer and admin panel). Data is stored in Elasticsearch and indexed from `news-flashs-server/data.json`. The consumer app includes Google Analytics (gtag) integration for tracking user interactions.

## Commands

### Backend (news-flashs-server)
```bash
cd news-flashs-server
yarn dev              # Start dev server with nodemon (port 3000)
yarn build            # TypeScript compilation (tsc)
yarn start            # Production server (node dist/index.js)

# Elasticsearch (Docker)
yarn create:es        # Create ES container
yarn start:es         # Start ES container
yarn stop:es          # Stop ES container
```

### Frontends
```bash
# Consumer app
cd news-flashs
yarn dev              # Vite dev server (port 8080) - proxies /api to backend
yarn build            # TypeScript + Vite build
yarn lint             # ESLint check
yarn format           # Prettier formatting

# Admin app
cd news-flashs-admin
yarn dev              # Vite dev server (port 8081) - directly calls localhost:3000
yarn build            # TypeScript + Vite build
yarn lint             # ESLint check
yarn format           # Prettier formatting
```

## Architecture

```
news-flashs-server/     # Express API server (port 3000)
├── src/index.ts        # Main entry, defines routes and ES setup
└── data.json           # News data indexed to ES (auto-created on startup)

news-flashs/            # Consumer React app (Vite + Tailwind, port 8080)
├── src/
│   ├── App.tsx         # Main layout with Header + Content
│   ├── components/
│   │   ├── Header.tsx  # "NEWS FLASH" header
│   │   └── Content.tsx # News grid with tag filtering (uses localStorage)
│   └── api/api.ts      # API calls (proxied through Vite)
└── vite.config.ts      # Proxies /api → localhost:3000

news-flashs-admin/      # Admin React app (Vite + Tailwind, port 8081)
├── src/
│   ├── App.tsx         # Admin interface with refresh button
│   ├── api/api.ts      # API calls to localhost:3000 (direct, no proxy)
│   └── components/
│       └── NewsList.tsx # Simple news list display
└── vite.config.ts      # Direct connection to backend (no proxy)
```

## API Endpoints

- `POST /news/refresh` - Re-index all news from data.json into Elasticsearch
- `GET /news?tags=tag1,tag2&size=20` - Retrieve news items filtered by tags
- `GET /tags/random?count=5` - Random sample of tags
- `GET /tags` - All available tags

## Data Model (NewsItem)

```typescript
{
  id: string;           // UUID
  title: string;        // Brief headline
  summary: string;      // 1-3 sentences
  fullContent: string;  // 3-8 sentences (expanded content)
  daysAgo: number;      // 0-7 (recency indicator)
  tags: string[];       // 1-3 topic tags
  sourceUrl: string;    // Article URL
}
```

## Development Setup

1. **Start Elasticsearch**: `cd news-flashs-server && yarn create:es && yarn start:es`
2. **Start backend**: `yarn dev` (port 3000)
   - Backend auto-creates Elasticsearch index if it doesn't exist
   - Indexes data from `data.json` on first startup
3. **Start consumer frontend**: `cd news-flashs && yarn dev` (port 8080)
   - Vite dev server proxies `/api` → `http://localhost:3000`
   - Includes Google Analytics integration
   - Persists selected tags in localStorage (`selectedHashtags`)
4. **Start admin frontend** (optional): `cd news-flashs-admin && yarn dev` (port 8081)
   - Direct API calls to `http://localhost:3000` (no proxy)

**Note**: The backend indices data automatically on startup. Use `POST /news/refresh` to re-index from `data.json`.
