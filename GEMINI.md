# GEMINI.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

- **base-elements/**: React + TypeScript + Vite base template with Tailwind CSS

## Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type safety and better DX
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **Axios** - HTTP client (pre-configured)
- **Lodash** - Utility library (pre-configured)

## Commands

### Base Elements (React Template)

```bash
cd base-elements
yarn dev              # Start Vite dev server (http://localhost:5173)
yarn build            # Build for production
yarn lint             # ESLint check
yarn format           # Format code with Prettier
yarn preview          # Preview production build
yarn clean            # Clean node_modules and dist
```

## Architecture

```
base-elements/          # React + TypeScript + Vite template
├── src/
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Application entry point
│   ├── index.css       # Global styles + Tailwind + custom utilities
│   ├── vite-env.d.ts   # Vite type declarations
│   └── assets/         # Static assets (react.svg)
├── public/             # Public static files
├── index.html          # HTML entry point
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── eslint.config.js    # ESLint configuration
└── .prettierrc        # Prettier configuration
```

## Development Setup

1. **Install dependencies**: `cd base-elements && yarn install`
2. **Start development server**: `yarn dev` (http://localhost:5173)
3. **Build for production**: `yarn build`
4. **Run linting**: `yarn lint`
5. **Format code**: `yarn format`

## Key Features

### Checkered Background Utility

The template includes a custom Tailwind utility class `.bg-checkerboard` that creates a subtle checkered pattern (defined in `src/index.css`).

### Global Styles

- Base font size: **16px**
- Custom scrollbar styling for WebKit browsers
- Light/dark color scheme support
- System font stack

## Available Scripts

- `yarn dev` - Start Vite development server (port 5173)
- `yarn build` - Build for production
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier
- `yarn preview` - Preview production build
- `yarn clean` - Clean node_modules and dist
