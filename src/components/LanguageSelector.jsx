import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSettingsContext } from "../stores/SettingsContext";
import "./LanguageSelector.css";

function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const { dispatch } = useSettingsContext();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const languages = [
    { code: "pt-BR", label: t("language.pt-BR"), flag: "https://flagcdn.com/24x18/br.png" },
    { code: "en", label: t("language.en"), flag: "https://flagcdn.com/24x18/us.png" },
    { code: "es", label: t("language.es"), flag: "https://flagcdn.com/24x18/es.png" },
  ];

  const current = languages.find((l) => l.code === i18n.language) || languages[0];

  function handleSelect(code) {
    dispatch({ type: "SET_LANG", payload: code });
    setOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="lang-selector" ref={ref}>
      <button
        className="lang-selector-btn"
        onClick={() => setOpen(!open)}
        aria-label={t("settings.language")}
      >
        <img className="lang-flag" src={current.flag} alt="" />
        {current.label}
      </button>
      {open && (
        <div className="lang-selector-menu">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`lang-selector-item ${lang.code === i18n.language ? "active" : ""}`}
              onClick={() => handleSelect(lang.code)}
            >
              <img className="lang-flag" src={lang.flag} alt="" />
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
