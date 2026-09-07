import { useEffect } from 'react'
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '../lib/seo'

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.content = content
}

function upsertLink(rel: string, href: string) {
  let tag = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!tag) {
    tag = document.createElement('link')
    tag.rel = rel
    document.head.appendChild(tag)
  }
  tag.href = href
}

/** Sets the per-page <title>, description, canonical link, and Open
    Graph/Twitter tags — matching each page's original <title>/<meta
    name="description"> in the static hand-off, extended to cover the tags
    social/search crawlers expect. `path` is the route (e.g. '/team'),
    used to build the canonical and og:url. scripts/prerender.mjs snapshots
    the DOM after this effect runs, so these tags end up baked into each
    route's static dist output too — not just set live for visitors
    navigating client-side. */
export function useDocumentMeta(title: string, description: string, path: string, image = DEFAULT_OG_IMAGE) {
  useEffect(() => {
    const url = new URL(path, SITE_URL).toString()

    document.title = title
    upsertMeta('name', 'description', description)
    upsertLink('canonical', url)

    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', image)

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', image)
  }, [title, description, path, image])
}
