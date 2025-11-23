# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A modern React + TypeScript + Vite base template with Tailwind CSS. This is a minimal starter template for building React applications with a focus on performance and developer experience.

## Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type safety and better DX
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **Axios** - HTTP client (pre-configured)
- **Lodash** - Utility library (pre-configured)

## Project Structure

```
base-elements/
├── src/
│   ├── App.tsx           # Main application component
│   ├── index.css         # Global styles + Tailwind + custom utilities
│   ├── main.tsx          # Application entry point
│   ├── vite-env.d.ts     # Vite type declarations
│   └── assets/           # Static assets
├── public/               # Public static files
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── eslint.config.js      # ESLint configuration
└── .prettierrc          # Prettier configuration
```

## Key Features

### Checkered Background Utility

The template includes a custom Tailwind utility class `.bg-checkerboard` that creates a subtle checkered pattern. This is defined in `src/index.css:7-19` and uses a CSS variable `--checkered-bg` (default: `rgba(10, 10, 10, 0.15)`).

**Usage:**
```tsx
<div className="bg-checkerboard text-gray-500 p-4 rounded-sm">
  Section Content
</div>
```

### Global Styles

- Base font size: **16px** (updated from default 12px)
- Custom scrollbar styling for WebKit browsers
- Light/dark color scheme support
- System font stack (system-ui, Avenir, Helvetica, Arial, sans-serif)

## Commands

```bash
# Install dependencies
yarn install

# Start development server (http://localhost:5173)
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Run linting
yarn lint

# Format code
yarn format

# Clean node_modules and dist
yarn clean
```

## Development

### Running the Dev Server

```bash
yarn dev
```

This starts Vite's dev server on http://localhost:5173 with:
- Hot Module Replacement (HMR)
- Fast refresh for React components
- TypeScript compilation on-the-fly

### Code Quality

**ESLint** is configured with:
- TypeScript support via `@typescript-eslint`
- React hooks rules
- React refresh support
- Prettier integration

**Prettier** handles code formatting with a focus on:
- Consistent indentation and spacing
- Trailing commas
- Single quotes for JSX

### Building for Production

```bash
yarn build
```

This creates an optimized production build in the `dist/` directory with:
- TypeScript compilation
- Vite's build optimizations (minification, tree-shaking, code splitting)
- Asset optimization

## Customization

### Updating the Checkered Background

Modify the CSS variable in `src/index.css:3`:

```css
:root {
  --checkered-bg: rgba(10, 10, 10, 0.15); /* Adjust opacity/color */
}
```

Or use inline styles:

```tsx
<div style={{ '--checkered-bg': 'rgba(255, 0, 0, 0.2)' } as React.CSSProperties} className="bg-checkerboard">
```

### Tailwind Configuration

The `tailwind.config.js` is minimal and ready to extend:

```js
theme: {
  extend: {
    // Add custom colors, fonts, spacing, etc.
  },
}
```

### Dependencies

Common additions for React projects:
- **Routing**: `react-router-dom`
- **State Management**: `zustand`, `redux-toolkit`, or `jotai`
- **Forms**: `react-hook-form` + `@hookform/resolvers`
- **UI Components**: `headlessui` or `radix-ui`
- **Charts**: `recharts` or `chart.js`
- **Testing**: `vitest` + `@testing-library/react`

## Configuration Files

### TypeScript (`tsconfig.json`)
- React 19 JSX support
- Strict mode enabled
- Path aliases configured for `@/*`

### Vite (`vite.config.ts`)
- React plugin configured
- Path resolution for `@/*` imports

### ESLint (`eslint.config.js`)
- TypeScript ESLint parser
- React hooks and refresh plugins
- Prettier integration

## Best Practices

1. **Component Structure**: Use functional components with TypeScript
2. **Styling**: Prefer Tailwind utility classes over custom CSS
3. **Code Quality**: Run `yarn lint` and `yarn format` before committing
4. **Imports**: Use the `@/*` alias for absolute imports from `src/`
5. **State**: Consider lightweight state libraries (Zustand, Jotai) over Context for complex state
6. **Performance**: Leverage React 19's features and Vite's optimizations

## Notes

- This is a **template/base** project - customize as needed for your use case
- The checkered background is a visual demo - remove or modify in `src/App.tsx:6` for your application
- Dependencies are minimal - add what you need for your specific project
- The project uses Yarn as the package manager
