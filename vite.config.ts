import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-404-fallback',
      closeBundle() {
        const distDir = path.resolve(__dirname, 'dist')
        const indexPath = path.join(distDir, 'index.html')
        const fallbackPath = path.join(distDir, '404.html')
        if (fs.existsSync(indexPath)) {
          fs.copyFileSync(indexPath, fallbackPath)
          console.log('✓ Successfully created dist/404.html SPA fallback for Render/CDNs')
        }
      },
    },
  ],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
          'flow-vendor': ['reactflow'],
          'editor-vendor': ['@monaco-editor/react'],
        },
      },
    },
  },
})
