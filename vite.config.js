import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["icons/**/*"],
        devOptions: {
          enabled: true,
        },
        manifest: {
          name: "ComuNick",
          short_name: "ComuNick",
          description: "Comunicação Alternativa para Crianças Autistas Não-Verbais",
          theme_color: "#2c3e50",
          background_color: "#ecf0f1",
          display: "standalone",
          display_override: ["fullscreen", "standalone"],
          orientation: "portrait",
          scope: "/",
          start_url: "/",
          icons: [
            { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
            {
              src: "icons/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/static\.arasaac\.org\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "arasaac-pictograms",
                expiration: {
                  maxEntries: 500,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
              },
            },
          ],
        },
      }),
    ],
    server: {
      proxy: {
        "/api/tts": {
          target: "https://narrator-tts.linkzy.dev",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/tts/, ""),
          headers: {
            "X-API-Key": env.TTS_API_KEY || "",
          },
        },
      },
    },
  };
});
