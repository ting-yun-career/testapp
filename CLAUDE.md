# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

- **base-elements/**: React component library with Tailwind CSS styling tests
- **news-flashs/**: Consumer-facing news aggregation React app
- **news-flashs-admin/**: Admin panel React app for news management
- **news-flashs-server/**: Express API server with Elasticsearch backend
- **vite-react-ts-tailwind-template/**: React + Vite + Tailwind template

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

# Admin app
cd news-flashs-admin
yarn dev              # Vite dev server (port 8081) - directly calls localhost:3000
yarn build            # TypeScript + Vite build
yarn lint             # ESLint check

# Base elements (component library)
cd base-elements
yarn dev              # Vite dev server for component testing
yarn build            # TypeScript + Vite build

# Template
cd vite-react-ts-tailwind-template
yarn dev              # Vite dev server
yarn build            # TypeScript + Vite build
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
│   │   └── Content.tsx # News grid with tag filtering
│   └── api/api.ts      # API calls (proxied through Vite)
└── vite.config.ts      # Proxies /api → localhost:3000

news-flashs-admin/      # Admin React app (Vite + Tailwind, port 8081)
├── src/
│   ├── App.tsx         # Admin interface
│   ├── api/api.ts      # API calls to localhost:3000
│   └── components/
│       ├── Chat.tsx    # Chat interface
│       └── NewsList.tsx # News list display
└── vite.config.ts      # Direct connection to backend

base-elements/          # Component library for styling tests
├── src/
│   ├── App.tsx         # Font weight demonstrations
│   ├── components/     # Reusable components
│   └── main.tsx        # Entry point

vite-react-ts-tailwind-template/ # Base template
├── src/
│   ├── App.tsx         # Basic app structure
│   ├── components/
│   │   └── Chat.tsx    # Sample component
│   └── main.tsx
```

## API Endpoints

- `POST /news/refresh` - Re-index all news from data.json into Elasticsearch
- `GET /news?tags=tag1,tag2&size=20` - Retrieve news items filtered by tags
- `GET /tags/random?count=5` - Random sample of tags
- `GET /tags` - All available tags

## Development Setup

1. **Start Elasticsearch**: `cd news-flashs-server && yarn create:es && yarn start:es`
2. **Start backend**: `yarn dev` (port 3000)
   - Backend auto-creates Elasticsearch index if it doesn't exist
   - Indexes data from `data.json` on first startup
3. **Start consumer frontend**: `cd news-flashs && yarn dev` (port 8080)
   - Vite dev server proxies `/api` → `http://localhost:3000`
4. **Start admin frontend** (optional): `cd news-flashs-admin && yarn dev` (port 8081)
   - Direct API calls to `http://localhost:3000` (no proxy)

**Note**: The backend indexes data automatically on startup. Use `POST /news/refresh` to re-index from `data.json`.
