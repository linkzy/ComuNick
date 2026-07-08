import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useTTS } from "../hooks/useTTS";
import "./Cell.css";

function Cell({ cell }) {
  const { t } = useTranslation();
  const { speak } = useTTS();
  const [imgError, setImgError] = useState(false);
  const [pressed, setPressed] = useState(false);
  const lastTap = useRef(0);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 500) return;
    lastTap.current = now;
    speak(cell.speech || cell.label);
  }, [cell.speech, cell.label, speak]);

  const ariaLabel = `${
    cell.label || t("cell.empty")
  }${cell.speech ? ` - ${cell.speech}` : ""}`;

  return (
    <button
      className={`cell${pressed ? " cell-pressed" : ""}`}
      onClick={handleTap}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onTouchMove={() => setPressed(false)}
      aria-label={ariaLabel}
      style={{
        backgroundColor: cell.backgroundColor || "#2c3e50",
        color: cell.textColor || "#ffffff",
      }}
    >
      {cell.imageUrl && !imgError ? (
        <img
          className="cell-image"
          src={cell.imageUrl}
          alt=""
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="cell-fallback" aria-hidden="true">
          {cell.label?.[0] || "?"}
        </div>
      )}
      <span className="cell-label">{cell.label || "---"}</span>
    </button>
  );
}

export default Cell;
