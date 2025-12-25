import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/erp-image-proxy': {
        target: 'https://nlfs.in/erp',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/erp-image-proxy/, ''),
      },
    },
  },
})
