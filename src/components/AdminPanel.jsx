import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useBoardContext } from "../stores/BoardContext";
import { useSettingsContext } from "../stores/SettingsContext";
import CellEditor from "./CellEditor";
import "./AdminPanel.css";

const LONG_PRESS_MS = 5000;
const REQUIRED_TOUCHES = 3;
const APP_VERSION = "0.3.0";

function AdminPanel() {
  const { t } = useTranslation();
  const { dispatch, boards, currentBoard, currentBoardId } = useBoardContext();
  const { adminMode, dispatch: settingsDispatch } = useSettingsContext();
  const [editingCell, setEditingCell] = useState(null);
  const [showNewBoardInput, setShowNewBoardInput] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

  const longPressTimer = useRef(null);
  const touchCount = useRef(0);

  useEffect(() => {
    function handleTouchStart(e) {
      touchCount.current = e.touches.length;
      if (e.touches.length >= REQUIRED_TOUCHES) {
        longPressTimer.current = setTimeout(() => {
          settingsDispatch({ type: "TOGGLE_ADMIN" });
          touchCount.current = 0;
        }, LONG_PRESS_MS);
      }
    }

    function handleTouchEnd() {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      touchCount.current = 0;
    }

    function handleTouchMove() {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchmove", handleTouchMove);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [settingsDispatch]);

  function handleAddBoard() {
    if (!newBoardName.trim()) return;
    dispatch({ type: "ADD_BOARD", payload: { name: newBoardName.trim() } });
    setNewBoardName("");
    setShowNewBoardInput(false);
  }

  function handleDeleteBoard(id) {
    if (!window.confirm(t("admin.confirmDelete"))) return;
    dispatch({ type: "DELETE_BOARD", payload: id });
  }

  function handleSelectBoard(id) {
    dispatch({ type: "SET_CURRENT_BOARD", payload: id });
    settingsDispatch({ type: "SET_CURRENT_BOARD", payload: id });
  }

  function handleGridRowsChange(val) {
    const rows = Math.max(1, Math.min(12, parseInt(val) || 1));
    dispatch({
      type: "SET_GRID_SIZE",
      payload: { rows, cols: currentBoard?.cols || 2 },
    });
  }

  function handleGridColsChange(val) {
    const cols = Math.max(1, Math.min(12, parseInt(val) || 1));
    dispatch({
      type: "SET_GRID_SIZE",
      payload: { rows: currentBoard?.rows || 2, cols },
    });
  }

  function handleAddCell() {
    dispatch({ type: "ADD_CELL" });
  }

  function handleEditCell(cellId) {
    setEditingCell(cellId);
  }

  function handleSaveCell(cellId, data) {
    dispatch({ type: "UPDATE_CELL", payload: { id: cellId, ...data } });
    setEditingCell(null);
  }

  function handleRemoveCell(cellId) {
    if (currentBoard && Object.keys(currentBoard.cells).length <= 1) {
      alert("Board precisa de pelo menos uma cell");
      return;
    }
    dispatch({ type: "REMOVE_CELL", payload: cellId });
  }

  function handleMoveCell(index, dir) {
    if (!currentBoard) return;
    const order = [...currentBoard.cellsOrder];
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= order.length) return;
    [order[index], order[newIndex]] = [order[newIndex], order[index]];
    dispatch({ type: "REORDER_CELLS", payload: order });
  }

  if (!adminMode) return null;

  return (
    <>
      <div className="admin-panel">
        <div className="admin-header">
          <h2>{t("admin.title")}</h2>
          <button
            className="admin-close"
            onClick={() => settingsDispatch({ type: "TOGGLE_ADMIN" })}
          >
            ✕
          </button>
        </div>

        <div className="admin-section">
          <h3>{t("admin.boards")}</h3>
          <div className="admin-board-list">
            {boards.map((b) => (
              <div
                key={b.id}
                className={`admin-board-item ${b.id === currentBoardId ? "active" : ""}`}
                onClick={() => handleSelectBoard(b.id)}
              >
                <span>{b.name}</span>
                <button
                  className="admin-board-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBoard(b.id);
                  }}
                >
                  {t("admin.deleteBoard")}
                </button>
              </div>
            ))}
          </div>

          {showNewBoardInput ? (
            <div className="admin-new-board-form">
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Nome da nova prancha"
                onKeyDown={(e) => e.key === "Enter" && handleAddBoard()}
                autoFocus
              />
              <button onClick={handleAddBoard}>{t("admin.save")}</button>
              <button onClick={() => setShowNewBoardInput(false)}>
                {t("admin.cancel")}
              </button>
            </div>
          ) : (
            <button
              className="admin-btn"
              onClick={() => setShowNewBoardInput(true)}
            >
              + {t("admin.newBoard")}
            </button>
          )}
        </div>

        {currentBoard && (
          <>
            <div className="admin-section">
              <h3>{t("admin.rows")} × {t("admin.cols")}</h3>
              <div className="admin-grid-size">
                <label>
                  {t("admin.rows")}:
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={currentBoard.rows}
                    onChange={(e) => handleGridRowsChange(e.target.value)}
                  />
                </label>
                <label>
                  {t("admin.cols")}:
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={currentBoard.cols}
                    onChange={(e) => handleGridColsChange(e.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="admin-section">
              <h3>
                {t("admin.addCell")}
                <span className="admin-cell-count">
                  ({currentBoard.cellsOrder.length} cells)
                </span>
              </h3>
              <button className="admin-btn" onClick={handleAddCell}>
                + {t("admin.addCell")}
              </button>

              <div className="admin-cell-list">
                {currentBoard.cellsOrder.map((cellId, idx) => {
                  const cell = currentBoard.cells[cellId];
                  return (
                    <div key={cellId} className="admin-cell-item">
                      <div className="admin-cell-actions">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveCell(idx, -1)}
                        >
                          ▲
                        </button>
                        <button
                          disabled={idx === currentBoard.cellsOrder.length - 1}
                          onClick={() => handleMoveCell(idx, 1)}
                        >
                          ▼
                        </button>
                      </div>
                      <div
                        className="admin-cell-preview"
                        style={{ backgroundColor: cell.backgroundColor || "#2c3e50" }}
                      >
                        <span>{cell.label?.[0] || "?"}</span>
                      </div>
                      <div className="admin-cell-info">
                        <strong>{cell.label || "---"}</strong>
                        <small>{cell.speech || cell.label || "---"}</small>
                      </div>
                      <button
                        className="admin-cell-edit"
                        onClick={() => handleEditCell(cellId)}
                      >
                        {t("admin.editCell")}
                      </button>
                      <button
                        className="admin-cell-remove"
                        onClick={() => handleRemoveCell(cellId)}
                      >
                        {t("admin.removeCell")}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <div className="admin-footer">v{APP_VERSION}</div>
      </div>

      {editingCell && currentBoard?.cells[editingCell] && (
        <CellEditor
          cell={currentBoard.cells[editingCell]}
          onSave={(data) => handleSaveCell(editingCell, data)}
          onClose={() => setEditingCell(null)}
        />
      )}
    </>
  );
}

export default AdminPanel;
