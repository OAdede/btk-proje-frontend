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
    host: true, // LAN erişimi için 0.0.0.0'a bind et
    port: 5174,
    cors: true,
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'https://localhost:8080', // Spring Boot backend over HTTPS (local default)
        changeOrigin: true,
        secure: false,
        // Bazı backend'ler 401 ile WWW-Authenticate: Basic header'ı döndürdüğünde
        // tarayıcı Basic Auth popup'ı gösterir. Geliştirme ortamında bu header'ı
        // proxy üzerinde kaldırarak popup'ın çıkmasını engelliyoruz.
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const authHeader = proxyRes.headers['www-authenticate'];
            if (authHeader && /basic/i.test(String(authHeader))) {
              delete proxyRes.headers['www-authenticate'];
            }
          });
        },
      },
    },
  },
})
