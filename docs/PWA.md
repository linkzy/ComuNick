# PWA Configuration

## vite-plugin-pwa

PWA is configured via `vite-plugin-pwa` (based on Workbox).

```js
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/**/*"],
      manifest: {
        name: "ComuNick",
        short_name: "ComuNick",
        description: "Alternative Communication for Non-Verbal Autistic Children",
        theme_color: "#2c3e50",
        background_color: "#ecf0f1",
        display: "standalone",
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
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
    }),
  ],
});
```

## Service Worker

The `vite-plugin-pwa` generates the service worker automatically. Behavior:

1. **Install:** precaches all assets (JS, CSS, HTML, icons)
2. **Activate:** clears old caches
3. **Fetch:** 
   - Local assets: CacheFirst
   - ARASAAC pictograms: CacheFirst with 1-year expiration
   - Other requests: NetworkFirst

## Important: PWA on Android vs iOS

| Aspect | Android (Chrome) | iOS (Safari) |
|--------|-----------------|--------------|
| Installation | "Add to Home Screen" banner | Share > Add to Home Screen |
| Service Worker | Full support | Limited (may be evicted by OS) |
| Web Speech API | Chrome → Google TTS | Safari → native voices |
| Performance | Excellent | Good |
| Cache persistence | Good | Service workers may be evicted |

**Recommendation:** Develop and test primarily on Android (Chrome). Ensure it works on iOS but don't prioritize.

## Offline Strategy

```
Browser online:
  1. App loads from server
  2. Service worker caches assets
  3. Pictograms are downloaded and cached (via Workbox + IndexedDB)

Browser offline:
  1. Service worker serves assets from cache
  2. Boards load from IndexedDB
  3. Pictograms load from Workbox cache + IndexedDB
  4. TTS uses Web Speech API (native, works offline on Android)
```

## Hosting

Recommended for initial deploy:
- **Vercel** (simplest, git integration, automatic HTTPS)
- **Netlify** (equivalent alternative)
- **GitHub Pages** (free, but requires manual build or Actions)

The app must be served over HTTPS for the Service Worker to work.

## Best Practices

1. **Always serve via HTTPS** — Service Worker does not work over HTTP
2. **Test installation** — after deploy, test "Add to Home Screen" on a real device
3. **Pictogram caching** — don't rely solely on Workbox for pictograms; have a fallback in IndexedDB (data URLs)
4. **Updates** — `registerType: "autoUpdate"` makes the SW update automatically when the user leaves and returns. This may cause loss of unsaved state → save state to IndexedDB on every change.
5. **Custom splash screen** — `theme_color` and `background_color` in the manifest define the splash screen color when opening the installed app. Use colors consistent with the app theme.
