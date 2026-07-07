import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ptBR from "./pt-BR.json";
import en from "./en.json";
import es from "./es.json";

i18n.use(initReactI18next).init({
  resources: {
    "pt-BR": { translation: ptBR },
    en: { translation: en },
    es: { translation: es },
  },
  fallbackLng: "pt-BR",
  detection: {
    order: ["navigator"],
    caches: [],
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
