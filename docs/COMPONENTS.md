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

```jsx
function Grid() {
  const { board, loading, error } = useBoardContext();
  const gridStyle = useGrid(board?.rows, board?.cols);

  if (loading) return <SplashScreen />;
  if (error) return <ErrorMessage />;
  if (!board || board.rows === 0 || board.cols === 0)
    return <EmptyBoard />;

  return (
    <div className="grid" style={{ gridTemplateColumns: `repeat(${board.cols}, 1fr)` }}>
      {board.cellsOrder.map((cellId) => (
        <Cell key={cellId} cell={board.cells[cellId]} />
      ))}
    </div>
  );
}
```

## Cell.jsx

**Purpose:** Individual button that the user taps to produce speech.

**Responsibilities:**
- Display pictogram (SVG/PNG) + label below
- Immediate visual feedback on tap (via `:active` CSS or `onTouchStart`)
- Call `TTSEngine.speak(speech)` on tap
- Support color customization (admin can set backgroundColor and textColor)

**Props:**
```js
{
  cell: {
    id: string,
    label: string,
    speech: string,
    imageLocalPath?: string,
    imageUrl?: string,
    backgroundColor?: string,
    textColor?: string
  }
}
```

**States:**
- With image → displays image + label
- Without image → displays label only (colored placeholder)
- Admin mode → cell has highlighted border, tap opens cell editor

**Edge cases:**
- empty label → displays "---"
- empty speech → uses label as fallback
- image loading → skeleton/spinner
- image load failed → fallback with label initials
- Accidental repeated tap → 500ms debounce between speech

```jsx
function Cell({ cell }) {
  const { speak } = useTTS();
  const [imgError, setImgError] = useState(false);
  const lastTap = useRef(0);

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 500) return; // debounce
    lastTap.current = now;
    speak(cell.speech || cell.label);
  };

  return (
    <button
      className="cell"
      onClick={handleTap}
      style={{
        backgroundColor: cell.backgroundColor || "#2c3e50",
        color: cell.textColor || "#ffffff"
      }}
    >
      {cell.imageUrl && !imgError ? (
        <img src={cell.imageUrl} alt={cell.label} onError={() => setImgError(true)} />
      ) : (
        <div className="cell-fallback">{cell.label?.[0] || "?"}</div>
      )}
      <span className="cell-label">{cell.label || "---"}</span>
    </button>
  );
}
```

## AdminPanel.jsx

**Purpose:** Interface for the speech therapist to configure boards.

**Responsibilities:**
- Activated by long press (5s) with 3 fingers → `SettingsContext.adminMode = true`
- Display current board in edit mode
- Change rows/cols (grid resizes preserving existing cells)
- Add new board
- Select existing board to edit
- Add/remove/reorder cells
- Edit cell (label, speech, image via ARASAAC search, colors)
- Auto-save everything to IndexedDB

**States:**
- `editingCell` — cell currently being edited
- `searchResults` — ARASAAC search results
- `searching` — search loading state
- `boards` — list of all boards
- `currentBoard` — board being edited

**Edge cases:**
- Trying to remove the last cell → warn "Board needs at least one cell"
- rows × cols less than total cells → show warning, let therapist decide
- ARASAAC search with no results → "No pictograms found" + skip option
- Therapist edits board while child is using → board updates in real-time (via Context)
- Exiting admin mode without saving → already saved to IndexedDB (save on change)

```jsx
function AdminPanel() {
  const { adminMode, setAdminMode } = useSettingsContext();
  const { board, boards, saveBoard, addBoard, deleteBoard } = useBoardContext();
  const [editingCell, setEditingCell] = useState(null);
}
```

## SplashScreen.jsx

**Purpose:** Initial loading screen.

**Responsibilities:**
- Display logo/app name
- Show progress indicator (simple, no real precision)
- Start TTS warmup in background
- Disappear after app is ready (max 3s to avoid frustration)

## LanguageSelector.jsx

**Purpose:** Manual language switching.

**Responsibilities:**
- Display current language flag/indicator
- Open menu with available options (pt-BR, en, es initially)
- On select: update i18next.language + save to settings + reload UI

## Hooks

### useGrid.js

```js
function useGrid(rows, cols) {
  const cellHeight = Math.min(window.innerHeight / rows, window.innerWidth / cols);
  return { minHeight: cellHeight };
}
```

### useTTS.js

```js
function useTTS() {
  const speak = (text) => TTSEngine.speak(text);
  return { speak, isReady: TTSEngine.ready };
}
```
