import "./LoaderOverlay.css";

export default function LoaderOverlay({ message }) {
  return (
    <div className="loader-overlay">
      <div className="loader-overlay-box">
        <div className="loader-spinner" />
        <p className="loader-message">{message || "Aguarde..."}</p>
      </div>
    </div>
  );
}
