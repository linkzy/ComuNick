import { createContext, useContext, useReducer, useEffect } from "react";
import { getSettings, saveSettings } from "../db/operations";
import i18n from "../i18n";

const SettingsContext = createContext(null);

const initialSettings = {
  lang: "pt-BR",
  currentBoardId: null,
  adminMode: false,
  ttsRate: 1.0,
  ttsPitch: 1.0,
  ttsProvider: "native",
  ttsExternalUrl: "",
  theme: "light",
};

function settingsReducer(state, action) {
  switch (action.type) {
    case "SET_SETTINGS":
      return { ...state, ...action.payload };
    case "SET_LANG": {
      i18n.changeLanguage(action.payload);
      return { ...state, lang: action.payload };
    }
    case "TOGGLE_ADMIN":
      return { ...state, adminMode: !state.adminMode };
    case "SET_ADMIN":
      return { ...state, adminMode: action.payload };
    case "SET_TTS_RATE":
      return { ...state, ttsRate: action.payload };
    case "SET_TTS_PITCH":
      return { ...state, ttsPitch: action.payload };
    case "SET_CURRENT_BOARD":
      return { ...state, currentBoardId: action.payload };
    default:
      return state;
  }
}

export function SettingsProvider({ children }) {
  const [state, dispatch] = useReducer(settingsReducer, initialSettings);

  useEffect(() => {
    async function init() {
      try {
        const settings = await getSettings();
        if (settings) {
          dispatch({ type: "SET_SETTINGS", payload: settings });
          if (settings.lang) {
            i18n.changeLanguage(settings.lang);
          }
        }
      } catch (e) {
        console.warn("Failed to load settings:", e);
      }
    }
    init();
  }, []);

  useEffect(() => {
    saveSettings(state);
  }, [state]);

  const value = { ...state, dispatch };

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettingsContext must be used within SettingsProvider");
  return ctx;
}
