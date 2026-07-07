# State Management

## Approach: useReducer + Context

The app does NOT use Redux, Zustand, or any external state library. The app's complexity does not justify the dependency.

## Contexts

### BoardContext

Manages the active board and all available boards.

```js
// stores/BoardContext.jsx
const BoardContext = createContext();

// Initial state
const initialState = {
  boards: [],           // all boards
  currentBoardId: null, // active board id
  loading: true,
  error: null,
};

// Actions
const actions = {
  SET_BOARDS: "SET_BOARDS",
  SET_CURRENT_BOARD: "SET_CURRENT_BOARD",
  ADD_BOARD: "ADD_BOARD",
  DELETE_BOARD: "DELETE_BOARD",
  UPDATE_BOARD: "UPDATE_BOARD",
  ADD_CELL: "ADD_CELL",
  UPDATE_CELL: "UPDATE_CELL",
  REMOVE_CELL: "REMOVE_CELL",
  REORDER_CELLS: "REORDER_CELLS",
  SET_GRID_SIZE: "SET_GRID_SIZE",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
};

function boardReducer(state, action) {
  switch (action.type) {
    case "SET_BOARDS":
      return { ...state, boards: action.payload, loading: false };
    case "SET_CURRENT_BOARD":
      return { ...state, currentBoardId: action.payload };
    case "ADD_BOARD": {
      const newBoard = {
        id: generateId(),
        name: "Nova Prancha",
        rows: 2,
        cols: 2,
        cells: {},
        cellsOrder: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...action.payload,
      };
      return {
        ...state,
        boards: [...state.boards, newBoard],
        currentBoardId: newBoard.id,
      };
    }
    case "DELETE_BOARD": {
      const filtered = state.boards.filter((b) => b.id !== action.payload);
      return {
        ...state,
        boards: filtered,
        currentBoardId:
          state.currentBoardId === action.payload
            ? filtered[0]?.id || null
            : state.currentBoardId,
      };
    }
    case "UPDATE_BOARD": {
      const updated = state.boards.map((b) =>
        b.id === action.payload.id
          ? { ...b, ...action.payload, updatedAt: Date.now() }
          : b
      );
      return { ...state, boards: updated };
    }
    case "ADD_CELL": {
      const board = state.boards.find((b) => b.id === state.currentBoardId);
      if (!board) return state;
      const cellId = `cell_${Date.now()}`;
      const cell = { id: cellId, label: "", speech: "", ...action.payload };
      const updatedBoard = {
        ...board,
        cells: { ...board.cells, [cellId]: cell },
        cellsOrder: [...board.cellsOrder, cellId],
        updatedAt: Date.now(),
      };
      return {
        ...state,
        boards: state.boards.map((b) => (b.id === updatedBoard.id ? updatedBoard : b)),
      };
    }
    // ... other cases follow the same pattern
  }
}
```

### SettingsContext

Manages global settings (language, admin mode, TTS preferences).

```js
// stores/SettingsContext.jsx
const SettingsContext = createContext();

const initialSettings = {
  lang: "pt-BR",
  adminMode: false,
  ttsRate: 1.0,
  ttsPitch: 1.0,
  ttsProvider: "native",
  theme: "light",
};

function settingsReducer(state, action) {
  switch (action.type) {
    case "SET_LANG":
      return { ...state, lang: action.payload };
    case "TOGGLE_ADMIN":
      return { ...state, adminMode: !state.adminMode };
    case "SET_TTS_RATE":
      return { ...state, ttsRate: action.payload };
    // ...
  }
}
```

## Automatic Persistence

Every change in BoardContext or SettingsContext should be saved to IndexedDB.

```jsx
// App.jsx
function App() {
  const [boardState, boardDispatch] = useReducer(boardReducer, initialState);
  const [settingsState, settingsDispatch] = useReducer(settingsReducer, initialSettings);

  // Load data from IndexedDB on initialization
  useEffect(() => {
    async function init() {
      try {
        const boards = await getAllBoards();
        boardDispatch({ type: "SET_BOARDS", payload: boards });

        const settings = await getSettings();
        if (settings) {
          settingsDispatch({ type: "SET_SETTINGS", payload: settings });
        }
      } catch (e) {
        boardDispatch({ type: "SET_ERROR", payload: e.message });
      }
    }
    init();
  }, []);

  // Save boards when they change
  useEffect(() => {
    if (boardState.loading) return;
    boardState.boards.forEach((board) => saveBoard(board));
  }, [boardState.boards]);

  // Save settings when they change
  useEffect(() => {
    if (boardState.loading) return;
    saveSettings(settingsState);
  }, [settingsState]);

  // ...
}
```

## Why not Redux/Zustand?

1. **Few global states** — only boards and settings
2. **No complex async logic** — no thunks, sagas, etc.
3. **Props drilling is not an issue** — max depth of 3 components
4. **Fewer dependencies** — less chance of breaking changes, smaller bundle
5. **AI generates useReducer better** — predictable pattern, easy to debug

## Best Practices

1. **Immutable state** — always spread/copy, never mutate directly
2. **Save on change** — save to IndexedDB on every change via useEffect
3. **No state in parent components that aren't Providers** — App.jsx only has Providers
4. **Separate board editing state** — when admin is editing a cell, the edit state stays in AdminPanel (local state), not in global Context
5. **Loading states** — always handle initial loading; IndexedDB may take 100-300ms to open
