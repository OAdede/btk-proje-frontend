import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Frontend URL'sini environment variable olarak tanımla
    'process.env.FRONTEND_URL': JSON.stringify(process.env.FRONTEND_URL || 'http://localhost:5174'),
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'https://localhost:8080', // Spring Boot backend over HTTPS (local default)
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
