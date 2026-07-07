# Architecture

## Overview

ComuNick is a single-page application (SPA) built with React 18 + Vite, packaged as a PWA to work offline on mobile devices. The architecture is based on Context API + useReducer for global state, with persistence in IndexedDB.

```
┌─────────────────────────────────────────┐
│              Service Worker              │
│  (asset + pictogram cache)              │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│              App.jsx                     │
│  ┌─────────┐ ┌────────┐ ┌───────────┐  │
│  │ i18next │ │ TTS    │ │ IndexedDB │  │
│  │ setup   │ │ warmup │ │ init      │  │
│  └─────────┘ └────────┘ └───────────┘  │
│         │         │           │         │
│  ┌──────▼─────────▼───────────▼──────┐ │
│  │         Main Content              │ │
│  │  ┌────────────────────────────┐   │ │
│  │  │   Grid (CSS Grid, dyn)     │   │ │
│  │  │  ┌────┐ ┌────┐ ┌────┐    │   │ │
│  │  │  │Cell│ │Cell│ │Cell│    │   │ │
│  │  │  └────┘ └────┘ └────┘    │   │ │
│  │  └────────────────────────────┘   │ │
│  │  ┌────────────────────────────┐   │ │
│  │  │  AdminPanel (hidden)       │   │ │
│  │  └────────────────────────────┘   │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Initialization Flow

```
1. App mounts
2. i18next init() with navigator.language, fallback pt-BR
3. IndexedDB opened (via idb library), schema validated
4. SplashScreen displayed (1-2s)
5. TTSEngine.warmup() called (empty utterance volume 0)
6. BoardContext loads current board from IndexedDB
7. Grid rendered with board's rows×cols
8. SplashScreen removed, app ready for use
```

## Touch Flow (User Mode)

```
1. User taps a Cell
2. Immediate visual feedback (scale/opacity)
3. TTSEngine.speak(cell.speech)
   - If TTS not ready: calls warmup() first
   - Sets utterance.lang = i18next.language
   - speechSynthesis.speak(utterance)
4. (Future optional) highlight animation on cell
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

## Directory Structure

```
comunick/
├── index.html                     # Entry point HTML + PWA meta tags
├── vite.config.js                 # Vite config + PWA plugin
├── package.json                   # Dependencies
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
│   │   ├── Grid.css               # CSS Grid layout
│   │   ├── Cell.jsx               # Individual button
│   │   ├── Cell.css               # Button styles
│   │   ├── AdminPanel.jsx         # Edit panel
│   │   ├── AdminPanel.css         # Admin styles
│   │   ├── SplashScreen.jsx       # Loading screen
│   │   ├── SplashScreen.css       # Splash styles
│   │   └── LanguageSelector.jsx   # Language selector
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
│   ├── db/
│   │   ├── schema.js              # IndexedDB Schema
│   │   └── operations.js          # CRUD operations
│   └── hooks/
│       ├── useGrid.js             # Responsive grid logic
│       └── useTTS.js              # TTS hook
├── README.md
└── docs/
    ├── CONTEXT.md
    ├── ARCHITECTURE.md
    ├── DATA_MODEL.md
    ├── COMPONENTS.md
    ├── TTS.md
    ├── ARASAAC.md
    ├── PWA.md
    ├── I18N.md
    └── DEV_WORKFLOW.md
```
