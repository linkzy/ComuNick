import { createContext, useContext, useReducer, useEffect } from "react";
import { getAllBoards, saveBoard, getSettings } from "../db/operations";

const BoardContext = createContext(null);

const initialState = {
  boards: [],
  currentBoardId: null,
  loading: true,
  error: null,
};

function boardReducer(state, action) {
  switch (action.type) {
    case "SET_BOARDS":
      return { ...state, boards: action.payload, loading: false };
    case "SET_CURRENT_BOARD":
      return { ...state, currentBoardId: action.payload };
    case "ADD_BOARD": {
      const newBoard = {
        id: `board_${Date.now()}`,
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
        boards: state.boards.map((b) =>
          b.id === updatedBoard.id ? updatedBoard : b
        ),
      };
    }
    case "UPDATE_CELL": {
      const board = state.boards.find((b) => b.id === state.currentBoardId);
      if (!board || !board.cells[action.payload.id]) return state;
      const updatedBoard = {
        ...board,
        cells: {
          ...board.cells,
          [action.payload.id]: {
            ...board.cells[action.payload.id],
            ...action.payload,
          },
        },
        updatedAt: Date.now(),
      };
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === updatedBoard.id ? updatedBoard : b
        ),
      };
    }
    case "REMOVE_CELL": {
      const board = state.boards.find((b) => b.id === state.currentBoardId);
      if (!board) return state;
      const { [action.payload]: _, ...remainingCells } = board.cells;
      const updatedBoard = {
        ...board,
        cells: remainingCells,
        cellsOrder: board.cellsOrder.filter((id) => id !== action.payload),
        updatedAt: Date.now(),
      };
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === updatedBoard.id ? updatedBoard : b
        ),
      };
    }
    case "REORDER_CELLS": {
      const board = state.boards.find((b) => b.id === state.currentBoardId);
      if (!board) return state;
      const updatedBoard = {
        ...board,
        cellsOrder: action.payload,
        updatedAt: Date.now(),
      };
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === updatedBoard.id ? updatedBoard : b
        ),
      };
    }
    case "SET_GRID_SIZE": {
      const board = state.boards.find((b) => b.id === state.currentBoardId);
      if (!board) return state;
      const updatedBoard = {
        ...board,
        rows: action.payload.rows,
        cols: action.payload.cols,
        updatedAt: Date.now(),
      };
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === updatedBoard.id ? updatedBoard : b
        ),
      };
    }
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  useEffect(() => {
    async function init() {
      try {
        const boards = await getAllBoards();
        dispatch({ type: "SET_BOARDS", payload: boards });

        if (boards.length > 0) {
          const settings = await getSettings();
          const boardId = settings?.currentBoardId || boards[0].id;
          dispatch({ type: "SET_CURRENT_BOARD", payload: boardId });
        }
      } catch (e) {
        dispatch({ type: "SET_ERROR", payload: e.message });
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (state.loading) return;
    state.boards.forEach((board) => saveBoard(board));
  }, [state.boards, state.loading]);

  const currentBoard = state.boards.find((b) => b.id === state.currentBoardId) || null;

  const value = { ...state, currentBoard, dispatch };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoardContext() {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error("useBoardContext must be used within BoardProvider");
  return ctx;
}
