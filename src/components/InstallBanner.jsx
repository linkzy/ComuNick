import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./InstallBanner.css";

const DISMISSED_KEY = "comunick_install_banner_dismissed";

export default function InstallBanner() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const mq = window.matchMedia("(display-mode: standalone)");
    if (mq.matches) return;

    function handle(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    }

    window.addEventListener("beforeinstallprompt", handle);
    return () => window.removeEventListener("beforeinstallprompt", handle);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setShow(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  }

  if (!show) return null;

  return (
    <div className="install-banner" role="banner">
      <span className="install-banner-text">{t("installBanner.message")}</span>
      <div className="install-banner-actions">
        <button className="install-banner-install" onClick={handleInstall}>
          {t("installBanner.install")}
        </button>
        <button
          className="install-banner-dismiss"
          onClick={handleDismiss}
          aria-label={t("installBanner.dismiss")}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
