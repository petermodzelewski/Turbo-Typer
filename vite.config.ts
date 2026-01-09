import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.', // Serve from the current directory
  publicDir: 'public',
  build: {
    outDir: 'dist',
  },
  server: {
    open: true, // Automatically open browser
  }
})