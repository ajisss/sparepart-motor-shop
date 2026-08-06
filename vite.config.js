import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// One repo, two builds. VITE_APP_TARGET selects which app the single entry
// (src/main.jsx → '@app') resolves to. Because the alias points at exactly one
// file, Rollup only ever walks that app's module graph — the other app is
// structurally excluded from the bundle, not merely dead-code-eliminated.
//
//   VITE_APP_TARGET=admin  → admin dashboard (deploy behind Deployment Protection)
//   (unset / anything else) → public storefront catalog
const target = process.env.VITE_APP_TARGET === 'admin' ? 'admin' : 'storefront'
const appEntry = target === 'admin' ? './src/AdminApp.jsx' : './src/StorefrontApp.jsx'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': fileURLToPath(new URL(appEntry, import.meta.url)),
    },
  },
})
