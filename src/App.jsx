import { BoardProvider } from "./stores/BoardContext";
import { SettingsProvider } from "./stores/SettingsContext";
import Grid from "./components/Grid";
import AdminPanel from "./components/AdminPanel";
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
  return (
    <div className="app">
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
