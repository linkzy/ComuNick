import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useBoardContext } from "../stores/BoardContext";
import { getAudioCache, saveAudioCache } from "../db/operations";
import { generateAudio } from "../services/ttsApi";
import { playAudioBlob } from "../services/audioPlayer";
import { useTTS } from "../hooks/useTTS";
import LoaderOverlay from "./LoaderOverlay";
import "./Cell.css";

function Cell({ cell }) {
  const { t } = useTranslation();
  const { currentBoard } = useBoardContext();
  const { speak } = useTTS();
  const [imgError, setImgError] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [generating, setGenerating] = useState(false);
  const lastTap = useRef(0);
  const generatingRef = useRef(false);

  const cellKey = currentBoard ? `audio:${currentBoard.id}:${cell.id}` : null;

  const handleTap = useCallback(async () => {
    const now = Date.now();
    if (now - lastTap.current < 500) return;
    lastTap.current = now;

    if (generatingRef.current || !cellKey) return;

    const text = cell.speech || cell.label;
    if (!text || !text.trim()) return;

    try {
      const cached = await getAudioCache(cellKey);
      if (cached && cached.audio) {
        await playAudioBlob(cached.audio, text);
        return;
      }
    } catch (e) {
      console.warn("[Cell] audio cache read failed:", e);
    }

    generatingRef.current = true;
    setGenerating(true);

    try {
      const blob = await generateAudio(text);
      await saveAudioCache(cellKey, blob, text);
      generatingRef.current = false;
      setGenerating(false);
      await playAudioBlob(blob, text);
    } catch (e) {
      console.warn("[Cell] API failed, using native TTS:", e);
      generatingRef.current = false;
      setGenerating(false);
      speak(text);
    }
  }, [cellKey, cell.speech, cell.label, speak]);

  const ariaLabel = `${
    cell.label || t("cell.empty")
  }${cell.speech ? ` - ${cell.speech}` : ""}`;

  return (
    <>
      {generating && <LoaderOverlay message={t("app.loading")} />}
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
    </>
  );
}

export default Cell;
