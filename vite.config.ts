import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null, // Don't inject register script - we'll do it manually after page load
      includeAssets: [
        "favicon.jpg",
        "robots.txt",
        "logo.jpg",
        "naturuai-logo.jpg",
        "hero-donation.webp",
        "hero-donation-mobile.webp",
        "hero-donation-tablet.webp",
        "og-image.png",
        "icon-192x192.png",
        "icon-512x512.png",
      ],
      manifest: {
        name: "Meta Solidária",
        short_name: "Meta Solidária",
        description: "Junte-se a grupos solidários e transforme vidas através de doações colaborativas.",
        theme_color: "#22c55e",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        lang: "pt-BR",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,webp,svg,woff,woff2}"],
        // Force immediate activation of new service worker
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          // Cache local para imagens estaticas
          {
            urlPattern: /\.(webp|jpg|jpeg|png|svg)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "static-images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Cache para chunks JS com hash
          {
            urlPattern: /\/assets\/.*\.js$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "js-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Cache para CSS
          {
            urlPattern: /\/assets\/.*\.css$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "css-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Cache de Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
