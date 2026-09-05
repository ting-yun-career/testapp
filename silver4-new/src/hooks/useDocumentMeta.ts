import { useEffect } from 'react'

/** Sets the per-page <title> and meta description, matching each page's
    original <title>/<meta name="description"> in the static hand-off. */
export function useDocumentMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = description
  }, [title, description])
}
