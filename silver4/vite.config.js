import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'asset', dest: '.' },
        { src: 'vendor', dest: '.' },
      ]
    })
  ],
  server: {
    port: 3000,
    open: true
  }
})
