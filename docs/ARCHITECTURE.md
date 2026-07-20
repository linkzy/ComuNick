# Architecture

## Overview

ComuNick is a single-page application (SPA) built with React 18 + Vite, packaged as a PWA to work offline on mobile devices. The architecture is based on Context API + useReducer for global state, with persistence in IndexedDB.

```
                        ┌─────────────────────────────────┐
                        │         Service Worker           │
                        │  (asset + pictogram cache)       │
                        └──────────────┬──────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────┐
│                              App.jsx                                │
│  ┌─────────┐   ┌────────────┐   ┌──────────┐   ┌───────────────┐  │
│  │ i18next │   │ TTS warmup │   │ IndexedDB│   │ InstallBanner │  │
│  │ setup   │   │ (native)   │   │ init     │   │ (PWA prompt)  │  │
│  └─────────┘   └────────────┘   └──────────┘   └───────────────┘  │
│         │            │              │                               │
│  ┌──────▼────────────▼──────────────▼───────────────────────────┐  │
│  │                   Main Content                                │  │
│  │  ┌──────────────────────────────────────────────────┐        │  │
│  │  │   Grid (CSS Grid, dynamic rows×cols)             │        │  │
│  │  │  ┌──────┐ ┌──────┐ ┌──────┐                    │        │  │
│  │  │  │ Cell │ │ Cell │ │ Cell │  (tap → TTS)       │        │  │
│  │  │  └──────┘ └──────┘ └──────┘                    │        │  │
│  │  └──────────────────────────────────────────────────┘        │  │
│  │  ┌──────────────────────────────────────────────────┐        │  │
│  │  │   AdminPanel (hidden, 3-finger long press)       │        │  │
│  │  │   + CellEditor, LanguageSelector, ttsProvider    │        │  │
│  │  └──────────────────────────────────────────────────┘        │  │
│  │  ┌──────────────────────────────────────────────────┐        │  │
│  │  │   LoaderOverlay (blocking spinner, conditional)  │        │  │
│  │  └──────────────────────────────────────────────────┘        │  │
│  └───────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

## Initialization Flow

```
1. App mounts
2. i18next init() with navigator.language, fallback pt-BR
3. IndexedDB opened (via idb library), schema validated (DB_VERSION 2)
4. SplashScreen displayed (1-2s)
5. TTSEngine.warmup() called (empty utterance volume 0)
6. BoardContext loads current board from IndexedDB
7. Grid rendered with board's rows×cols
8. SplashScreen removed, app ready for use
```

## Touch Flow (User Mode) — Native TTS

```
1. User taps a Cell
2. Immediate visual feedback (scale/opacity via .cell-pressed)
3. TTSEngine.speak(cell.speech or cell.label)
   - If TTS not ready: calls warmup() first
   - Auto-selects voice by i18n.language
4. speechSynthesis.speak(utterance)
```

## Touch Flow (User Mode) — Narrator TTS API

```
1. User taps a Cell
2. Immediate visual feedback
3. Cell checks audio_cache in IndexedDB:
   a. Found → play cached MP3 blob via audioPlayer.js
   b. Not found → show LoaderOverlay, call /api/tts/synthesize
      - Save blob to audio_cache
      - Play blob via audioPlayer.js (new Audio())
      - If API fails → fallback to native TTS (speak())
```

## Edit Flow (Admin Mode)

```
1. Long press (5s) with 3 fingers → AdminPanel activated
2. AdminPanel reads current BoardContext
3. Speech therapist changes rows, cols, adds/removes/edits cells
4. Each change → BoardContext.dispatch → IndexedDB.saveBoard()
5. Grid re-renders automatically
6. Long press (5s) with 3 fingers → AdminPanel deactivated
```

## Proxy Architecture (Narrator TTS)

```
Dev:
  Client ──► /api/tts/synthesize ──► Vite proxy ──► https://narrator-tts.linkzy.dev
               (no key)               (adds X-API-Key from .env)

Prod:
  Client ──► /api/tts/synthesize ──► nginx proxy ──► https://narrator-tts.linkzy.dev
               (no key)               (adds X-API-Key from $TTS_API_KEY)
```

## Directory Structure

```
comunick/
├── index.html                     # Entry point HTML + PWA meta tags
├── vite.config.js                 # Vite config + PWA plugin + dev proxy
├── nginx.conf                     # Prod proxy config
├── Dockerfile                     # Multi-stage build (node → nginx)
├── package.json                   # Dependencies
├── .gitignore                     # node_modules, dist, .env
├── .github/workflows/ci-cd.yml    # CI/CD pipeline
├── scripts/
│   └── generate-icons.cjs         # App icon generation via sharp
├── public/
│   └── icons/                     # PWA icons (192x192, 512x512)
│       ├── icon-192.png
│       └── icon-512.png
├── src/
│   ├── main.jsx                   # ReactDOM.createRoot
│   ├── App.jsx                    # Provider wrapper + layout
│   ├── App.css                    # Global styles
│   ├── components/
│   │   ├── Grid.jsx               # Dynamic rows×cols grid
│   │   ├── Grid.css
│   │   ├── Cell.jsx               # Individual button (TTS + audio cache)
│   │   ├── Cell.css
│   │   ├── CellEditor.jsx         # Cell edit modal (with audio pre-gen)
│   │   ├── CellEditor.css
│   │   ├── AdminPanel.jsx         # Edit panel + settings
│   │   ├── AdminPanel.css
│   │   ├── SplashScreen.jsx       # Loading screen
│   │   ├── SplashScreen.css
│   │   ├── LanguageSelector.jsx   # Language switcher
│   │   ├── InstallBanner.jsx      # PWA install prompt
│   │   ├── InstallBanner.css
│   │   └── LoaderOverlay.jsx      # Blocking spinner overlay
│   │   └── LoaderOverlay.css
│   ├── stores/
│   │   ├── BoardContext.jsx       # Board Context + Provider
│   │   └── SettingsContext.jsx    # Settings Context + Provider
│   ├── i18n/
│   │   ├── pt-BR.json             # pt-BR translation
│   │   ├── en.json                # English translation
│   │   ├── es.json                # Spanish translation
│   │   └── index.js               # i18next initialization
│   ├── tts/
│   │   └── TTSEngine.js           # Web Speech API wrapper
│   ├── services/
│   │   ├── ttsApi.js              # Narrator TTS API client
│   │   ├── audioPlayer.js         # Audio blob player
│   │   └── arasaac.js             # ARASAAC API client
│   ├── db/
│   │   ├── schema.js              # IndexedDB schema (v2)
│   │   └── operations.js          # CRUD operations
│   └── hooks/
│       ├── useGrid.js             # Responsive grid logic
│       └── useTTS.js              # TTS hook
├── docs/
│   ├── CONTEXT.md
│   ├── ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   ├── COMPONENTS.md
│   ├── TTS.md
│   ├── ARASAAC.md
│   ├── PWA.md
│   ├── I18N.md
│   └── DEV_WORKFLOW.md
└── README.md
```
