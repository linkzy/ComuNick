import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { searchPictograms, getPictogramUrl, downloadAndCachePictogram } from "../services/arasaac";
import "./CellEditor.css";

function CellEditor({ cell, onSave, onClose }) {
  const { t, i18n } = useTranslation();
  const [label, setLabel] = useState(cell.label || "");
  const [speech, setSpeech] = useState(cell.speech || "");
  const [backgroundColor, setBackgroundColor] = useState(
    cell.backgroundColor || "#2c3e50"
  );
  const [textColor, setTextColor] = useState(cell.textColor || "#ffffff");
  const [imageUrl, setImageUrl] = useState(cell.imageUrl || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);

  const searchTimer = useRef(null);

  const doSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const lang = i18n.language?.split("-")[0] || "pt";
    const results = await searchPictograms(query, lang);
    setSearchResults(results);
    setSearching(false);
  }, [i18n.language]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => doSearch(searchQuery), 400);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [searchQuery, doSearch]);

  async function handleSelectPictogram(item) {
    setSelectedImageId(item.id);
    const dataUrl = await downloadAndCachePictogram(item.id);
    if (dataUrl) {
      setImageUrl(dataUrl);
    } else {
      setImageUrl(getPictogramUrl(item.id));
    }
    setSearchQuery("");
    setSearchResults([]);
  }

  function handleSave() {
    onSave({
      label,
      speech,
      backgroundColor,
      textColor,
      imageUrl: imageUrl || null,
      imageId: selectedImageId || cell.imageId || null,
    });
  }

  return (
    <div className="cell-editor-overlay" onClick={onClose}>
      <div className="cell-editor" onClick={(e) => e.stopPropagation()}>
        <div className="cell-editor-header">
          <h3>{t("admin.editCell")}</h3>
          <button className="cell-editor-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="cell-editor-body">
          <label>
            {t("admin.label")}
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: Água"
              autoFocus
            />
          </label>

          <label>
            {t("admin.speech")}
            <input
              type="text"
              value={speech}
              onChange={(e) => setSpeech(e.target.value)}
              placeholder="Ex: Quero água"
            />
          </label>

          <label>
            {t("admin.searchImage")}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("admin.searchPlaceholder")}
            />
          </label>

          {searching && (
            <div className="cell-editor-searching">{t("app.loading")}</div>
          )}

          {searchResults.length > 0 && (
            <div className="cell-editor-results">
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  className={`cell-editor-result-item ${selectedImageId === item.id ? "selected" : ""}`}
                  onClick={() => handleSelectPictogram(item)}
                >
                  <img
                    src={getPictogramUrl(item.id, 300)}
                    alt=""
                  />
                </button>
              ))}
            </div>
          )}

          {searchResults.length === 0 && searchQuery.length >= 2 && !searching && (
            <div className="cell-editor-no-results">{t("admin.noResults")}</div>
          )}

          {imageUrl && (
            <div className="cell-editor-preview">
              <img src={imageUrl} alt={label} />
            </div>
          )}

          <div className="cell-editor-colors">
            <label>
              Fundo
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
              />
            </label>
            <label>
              Texto
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="cell-editor-footer">
          <button className="cell-editor-btn cell-editor-btn-save" onClick={handleSave}>
            {t("admin.save")}
          </button>
          <button className="cell-editor-btn cell-editor-btn-cancel" onClick={onClose}>
            {t("admin.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CellEditor;
