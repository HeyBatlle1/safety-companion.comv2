import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __VITE_API_URL__: JSON.stringify(
      mode === 'production'
        ? 'https://api.safety-companion.com'
        : 'https://backend-production-b38d7.up.railway.app'
    ),
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://backend-production-b38d7.up.railway.app',
        changeOrigin: true,
      },
    },
  },
}))