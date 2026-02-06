import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // proxy API requests to the backend during development
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    port: 3000,
  },
})
