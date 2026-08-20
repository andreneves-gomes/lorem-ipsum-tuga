import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicons/*.svg', 'robots.txt'],
      manifest: {
        name: 'Lorem Ipsum Tuga',
        short_name: 'Ipsum Tuga',
        description: 'O gerador de texto oficial para encher chouriços com orgulho nacional. 🇵🇹',
        lang: 'pt-PT',
        theme_color: '#046A38',
        background_color: '#046A38',
        display: 'standalone',
        orientation: 'portrait',
        categories: ['utilities', 'productivity'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpeg,ico,woff2}'],
      },
    }),
  ],
})
