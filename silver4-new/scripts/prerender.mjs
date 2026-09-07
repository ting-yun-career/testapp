// Post-build step (see package.json "build" script): snapshots each route's
// fully client-rendered DOM into a static dist/<route>/index.html, and
// writes dist/sitemap.xml. This exists because the app is a client-only SPA
// (src/main.tsx uses createRoot, not hydrateRoot, so overwriting the
// snapshot's #root on load is safe) — without it, search/social crawlers
// that don't execute JS would only ever see the "/" route's content and
// meta tags, no matter which page they fetched.
//
// ROUTES must be kept in sync with the <Route> entries in src/App.tsx
// (equivalently, NAV_ITEMS in src/lib/constants.ts) — there are only four
// and they change rarely, so this is tracked by hand rather than shared
// via import (this script runs under plain Node, not Vite/TS).
import { chromium } from 'playwright'
import { preview } from 'vite'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

// Keep in sync with SITE_URL in src/lib/seo.ts.
const SITE_URL = 'https://silver4salon.com'

const ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/team', changefreq: 'monthly', priority: '0.8' },
  { path: '/gallery', changefreq: 'weekly', priority: '0.8' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
]

const DIST_DIR = path.resolve(import.meta.dirname, '..', 'dist')

async function main() {
  const server = await preview({ preview: { port: 4173, strictPort: false } })
  const url = server.resolvedUrls?.local?.[0]
  if (!url) throw new Error('vite preview did not return a local URL')

  const browser = await chromium.launch()
  const page = await browser.newPage()
  // The hero video (home route only) keeps the network busy indefinitely
  // once it starts buffering, so we can't wait for networkidle — and the
  // snapshot only needs the <video> markup, not its bytes.
  await page.route('**/*.mp4', (route) => route.abort())

  for (const route of ROUTES) {
    const target = new URL(route.path, url).toString()
    await page.goto(target, { waitUntil: 'load' })
    // Give React's post-mount effects (useDocumentMeta, useHours, reveal
    // observers, ...) a moment to run — everything on this route is static
    // data, nothing awaits a network response, so this is generous.
    await page.waitForTimeout(500)

    const html = await page.content()
    const outDir = path.join(DIST_DIR, route.path === '/' ? '' : route.path)
    await mkdir(outDir, { recursive: true })
    await writeFile(path.join(outDir, 'index.html'), html)
    console.log(`prerendered ${route.path} -> ${path.relative(DIST_DIR, outDir) || '.'}/index.html`)
  }

  await browser.close()
  await server.close()

  const lastmod = new Date().toISOString().slice(0, 10)
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...ROUTES.map((route) =>
      [
        '  <url>',
        `    <loc>${new URL(route.path, SITE_URL).toString()}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${route.changefreq}</changefreq>`,
        `    <priority>${route.priority}</priority>`,
        '  </url>',
      ].join('\n'),
    ),
    '</urlset>',
    '',
  ].join('\n')
  await writeFile(path.join(DIST_DIR, 'sitemap.xml'), sitemap)
  console.log('wrote sitemap.xml')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
