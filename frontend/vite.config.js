import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    process.env.VITE_ENABLE_HTTPS === 'true' ? basicSsl() : null
  ].filter(Boolean),
  server: {
    port: 3000,
    https: process.env.VITE_ENABLE_HTTPS === 'true',
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
