# Components

## Grid.jsx

**Purpose:** Renders the cell grid dynamically based on the active board.

**Responsibilities:**
- Read `rows` and `cols` from the current board in BoardContext
- Render cells using CSS Grid (`grid-template-columns: repeat(cols, 1fr)`)
- Calculate minimum cell size via `useGrid` hook
- Handle layout transitions when admin changes grid size

**States:**
- `board` — current board object (from BoardContext)
- `loading` — while board loads from IndexedDB
- `error` — if loading fails

**Edge cases:**
- `rows: 0` or `cols: 0` → show "Configure the board in admin mode"
- Empty board (no cells) → empty grid with "Add cells in admin mode"
- `rows * cols > 50` → performance warning (grid too large)
- rows/cols change in admin → grid must re-render without losing existing cell data

## Cell.jsx

**Purpose:** Individual button that the user taps to produce speech.

**Responsibilities:**
- Display pictogram (PNG) + label below (font-size 3rem)
- Immediate visual feedback on tap (via `.cell-pressed` class on touch)
- Dual TTS: native speak() or Narrator API with audio cache
- Show LoaderOverlay while audio is being generated
- 500ms debounce between taps to prevent double-speech

**Props:**
```js
{
  cell: {
    id: string,
    label: string,
    speech: string,
    imageUrl?: string,
    backgroundColor?: string,
    textColor?: string
  }
}
```

**TTS Flow:**
1. `ttsProvider === "native"` → call `speak(text)` directly (instant)
2. `ttsProvider === "narrator"`:
   - Check IndexedDB audio cache → play blob if cached
   - If not cached → generate via API → cache → play
   - API fails → fallback to native speak()

**Edge cases:**
- empty label → displays "---"
- empty speech → uses label as fallback
- image load failed → fallback with label initials
- API error → silent fallback to native TTS

## CellEditor.jsx

**Purpose:** Modal for editing individual cell properties.

**Responsibilities:**
- Edit label, speech text, colors (background + text)
- Search and select ARASAAC pictograms (debounced 400ms)
- Pre-generate audio when saving if `ttsProvider === "narrator"`
- Show LoaderOverlay during audio generation

**Props:**
```js
{
  cell: object,         // current cell data
  onSave: function,     // called with updated cell
  onClose: function     // close the modal
}
```

## AdminPanel.jsx

**Purpose:** Interface for the speech therapist to configure boards and settings.

**Responsibilities:**
- Activated by 3-finger 5-second long press
- Board CRUD (create, select, delete)
- Grid dimensions (rows 1-12, cols 1-12)
- Cell management (add, remove, reorder)
- Language selector (LanguageSelector component)
- TTS provider toggle (native / Narrator TTS)
- Speed and pitch sliders
- All changes auto-saved to IndexedDB

**States:**
- `editingCell` — cell currently being edited (opens CellEditor)
- `boards` — list of all boards
- `currentBoard` — board being edited

## SplashScreen.jsx

**Purpose:** Initial loading screen with TTS warmup.

**Responsibilities:**
- Display logo/app name + ARASAAC attribution
- Start TTS warmup in background
- Wait for IndexedDB boards to load
- Disappear after app is ready

## LanguageSelector.jsx

**Purpose:** Manual language switching (inside AdminPanel).

**Responsibilities:**
- Display flag images via flagcdn.com for each language
- On select: update i18next.language + save to settings

## InstallBanner.jsx

**Purpose:** Prompts user to install the PWA (when in browser, not installed).

**Responsibilities:**
- Listen for `beforeinstallprompt` event
- Show bar with install button + dismiss button
- Hidden when app is already in standalone mode
- CSS with `top: env(safe-area-inset-top)` for notched devices

## LoaderOverlay.jsx

**Purpose:** Fullscreen blocking spinner overlay during async operations.

**Props:**
```js
{
  message: string   // optional, displayed below spinner
}
```

**CSS:** Fixed position, z-index 2000, dark translucent backdrop, centered spinner + message.

## Hooks

### useGrid.js

```js
function useGrid(rows, cols) {
  // Calculates minimum cell height based on viewport
  const cellHeight = Math.min(window.innerHeight / rows, window.innerWidth / cols);
  return { minHeight: cellHeight };
}
```

### useTTS.js

```js
function useTTS() {
  // Returns speak() bound to TTSEngine
  const speak = (text) => TTSEngine.speak(text);
  return { speak, isReady: TTSEngine.ready };
}
```
