import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const PWA_THEME_COLOR = '#0f0a04'
const PWA_BACKGROUND_COLOR = '#0f0a04'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: [
        'favicon.ico',
        'yeetcraft-app-icon-192.png',
        'yeetcraft-app-icon-512.png',
        'yeetcraft-app-icon-512-maskable.png',
      ],
      manifest: {
        name: 'YeetCraft',
        short_name: 'YeetCraft',
        description:
          'Track WoW dungeon deaths and mistakes. The Hall of Shame awaits!',
        theme_color: PWA_THEME_COLOR,
        background_color: PWA_BACKGROUND_COLOR,
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'yeetcraft-app-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'yeetcraft-app-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'yeetcraft-app-icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,ttf}'],
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api(?:\/|$)/],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.url.includes('/api/'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ request, url }) =>
              url.origin === self.location.origin &&
              request.destination === 'image' &&
              /\.(?:webp|png|svg)$/i.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'yeetcraft-local-images',
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: ({ request, url }) =>
              url.origin === self.location.origin &&
              (request.destination === 'font' || /\.(?:woff2|ttf)$/i.test(url.pathname)),
            handler: 'CacheFirst',
            options: {
              cacheName: 'yeetcraft-local-fonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
