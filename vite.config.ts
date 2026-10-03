import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

/**
 * Content-Security-Policy for the production build only (Vite's dev server
 * injects inline scripts that a strict policy would block).
 * Allowed third parties: YouTube iframe API (player) and the GitHub REST API.
 * frame-ancestors cannot be set from a <meta>; set it as a header if the host allows.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' https://www.youtube.com https://s.ytimg.com",
  'frame-src https://www.youtube-nocookie.com https://www.youtube.com',
  "connect-src 'self' https://api.github.com",
  "img-src 'self' data: https://i.ytimg.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  'upgrade-insecure-requests',
].join('; ')

function securityHeaders(): Plugin {
  return {
    name: 'security-meta',
    apply: 'build',
    transformIndexHtml() {
      return [
        { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP }, injectTo: 'head-prepend' },
        // YouTube embeds need the origin as referrer; nothing more leaves the site.
        { tag: 'meta', attrs: { name: 'referrer', content: 'strict-origin-when-cross-origin' }, injectTo: 'head-prepend' },
      ]
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), securityHeaders()],
})
