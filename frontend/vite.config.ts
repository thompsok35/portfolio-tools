import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// API URL: Set VITE_API_URL in .env (see .env.example). Defaults to http://localhost:5000.
// The proxy mirrors the same default so local development (without Docker) works out of the box.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL ?? 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
