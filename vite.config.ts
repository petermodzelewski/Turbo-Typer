import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const base = env.VITE_BASE_PATH || '/'

  return {
    base,
    plugins: [react()],
    root: '.', // Serve from the current directory
    publicDir: 'public',
    build: {
      outDir: 'docs',
    },
    server: {
      open: true, // Automatically open browser
    },
  }
})
