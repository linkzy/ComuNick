import { useEffect, useState } from "react";
import { BoardProvider, useBoardContext } from "./stores/BoardContext";
import { SettingsProvider } from "./stores/SettingsContext";
import Grid from "./components/Grid";
import AdminPanel from "./components/AdminPanel";
import SplashScreen from "./components/SplashScreen";
import InstallBanner from "./components/InstallBanner";
import TTSEngine from "./tts/TTSEngine";
import { useSettingsContext } from "./stores/SettingsContext";

const TTS_TIMEOUT = 5000;

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
  const [ttsReady, setTtsReady] = useState(false);

  useEffect(() => {
    TTSEngine.onReady(() => setTtsReady(true));
    TTSEngine.warmup();

    const timer = setTimeout(() => {
      setTtsReady(true);
    }, TTS_TIMEOUT);

    return () => clearTimeout(timer);
  }, []);

  if (loading || !ttsReady) return <SplashScreen />;

  return (
    <div className="app">
      <InstallBanner />
      <Grid />
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
