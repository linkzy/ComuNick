import { useEffect } from "react";
import { BoardProvider, useBoardContext } from "./stores/BoardContext";
import { SettingsProvider } from "./stores/SettingsContext";
import Grid from "./components/Grid";
import AdminPanel from "./components/AdminPanel";
import SplashScreen from "./components/SplashScreen";
import LanguageSelector from "./components/LanguageSelector";
import TTSEngine from "./tts/TTSEngine";
import { useSettingsContext } from "./stores/SettingsContext";

function AdminToggle() {
  const { adminMode, dispatch } = useSettingsContext();

  if (adminMode) return null;

  return (
    <button
      className="admin-toggle-btn"
      onClick={() => dispatch({ type: "TOGGLE_ADMIN" })}
      title="Abrir modo admin"
      aria-label="Abrir modo admin"
    >
      ⚙
    </button>
  );
}

function AppContent() {
  const { loading } = useBoardContext();

  useEffect(() => {
    TTSEngine.warmup();
  }, []);

  if (loading) return <SplashScreen />;

  return (
    <div className="app">
      <Grid />
      <LanguageSelector />
      <AdminToggle />
      <AdminPanel />
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <BoardProvider>
        <AppContent />
      </BoardProvider>
    </SettingsProvider>
  );
}

export default App;
