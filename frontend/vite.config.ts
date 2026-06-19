import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // sockjs-client is a legacy CommonJS library that uses Node.js's `global`.
    // Vite runs in the browser where `global` doesn't exist — this maps it to
    // the standard `globalThis` which works in all modern browsers.
    global: 'globalThis',
  },
})
