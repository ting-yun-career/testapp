# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

News aggregation monorepo with a Node.js/Express backend and two React frontends (consumer viewer and admin panel). Data is stored in Elasticsearch and indexed from `news-flashs-server/data.json`.

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

### Frontends (news-flashs, news-flashs-admin)
```bash
cd news-flashs        # or news-flashs-admin
yarn dev              # Vite dev server (port 8080)
yarn build            # TypeScript + Vite build
yarn lint             # ESLint check
yarn format           # Prettier formatting
```

## Architecture

```
news-flashs-server/     # Express API server
├── src/index.ts        # Main entry, defines routes
├── src/esMgr.ts        # Elasticsearch client and operations
└── data.json           # News data indexed to ES

news-flashs/            # Consumer React app (Vite + Tailwind)
├── src/App.tsx         # Main component with news grid
└── vite.config.ts      # Proxies /api → localhost:3000

news-flashs-admin/      # Admin React app
└── src/App.tsx         # Admin interface with refresh capability
```

## API Endpoints

- `POST /news/refresh` - Re-index all news from data.json into Elasticsearch
- `GET /news?tags=tag1,tag2&size=20` - Retrieve news items filtered by tags
- `GET /tags/random?count=5` - Random sample of tags
- `GET /tags` - All available tags

## Data Model (NewsItem)

```typescript
{
  id: string;           // Base64 hash of summary
  title: string;        // Brief headline
  summary: string;      // 1-3 sentences
  fullContent: string;  // 3-8 sentences
  daysAgo: number;      // 0-7 (recency)
  tags: string[];       // 1-3 topic tags
  sourceUrl: string;    // Article URL
}
```

## Development Setup

1. Start Elasticsearch: `cd news-flashs-server && yarn create:es && yarn start:es`
2. Start backend: `yarn dev`
3. Index data: `curl -X POST http://localhost:3000/news/refresh`
4. Start frontend: `cd news-flashs && yarn dev`

The Vite dev server proxies `/api` requests to the backend at port 3000.
