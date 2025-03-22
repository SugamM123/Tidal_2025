import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.render.com/deploy/srv-cvfhj3rqf0us73fr24pg?key=wtMhzb-h-T8' || 'http://127.0.0.1:5000',
        changeOrigin: true
      }
    }
  }
})
