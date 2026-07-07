import { useState, useRef, useCallback } from "react";
import { useTTS } from "../hooks/useTTS";
import "./Cell.css";

function Cell({ cell }) {
  const { speak } = useTTS();
  const [imgError, setImgError] = useState(false);
  const lastTap = useRef(0);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 500) return;
    lastTap.current = now;
    speak(cell.speech || cell.label);
  }, [cell.speech, cell.label, speak]);

  return (
    <button
      className="cell"
      onClick={handleTap}
      style={{
        backgroundColor: cell.backgroundColor || "#2c3e50",
        color: cell.textColor || "#ffffff",
      }}
    >
      {cell.imageUrl && !imgError ? (
        <img
          className="cell-image"
          src={cell.imageUrl}
          alt={cell.label}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="cell-fallback">{cell.label?.[0] || "?"}</div>
      )}
      <span className="cell-label">{cell.label || "---"}</span>
    </button>
  );
}

export default Cell;
