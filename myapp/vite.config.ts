import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { cloudflare } from '@cloudflare/vite-plugin'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [react(), tailwindcss(), cloudflare()],
    define: {
      'import.meta.env.VITE_AUTH0_DOMAIN': JSON.stringify(env.VITE_AUTH0_DOMAIN),
      'import.meta.env.VITE_AUTH0_CLIENT_ID': JSON.stringify(env.VITE_AUTH0_CLIENT_ID),
      'import.meta.env.VITE_AUTH0_CONNECTION': JSON.stringify(env.VITE_AUTH0_CONNECTION),
      'import.meta.env.VITE_AUTH0_AUDIENCE': JSON.stringify(env.VITE_AUTH0_AUDIENCE),
      'import.meta.env.VITE_AUTH0_SCOPE': JSON.stringify(env.VITE_AUTH0_SCOPE),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL ?? '/'),
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts', 'worker/**/*.test.ts'],
    },
  }
})
