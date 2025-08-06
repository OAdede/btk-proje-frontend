import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.232.113:8080', // Spring Boot backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
