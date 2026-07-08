import { useTranslation } from "react-i18next";
import "./SplashScreen.css";

function SplashScreen() {
  const { t } = useTranslation();
  return (
    <div className="splash">
      <div className="splash-content">
        <h1 className="splash-title">ComuNick</h1>
        <p className="splash-subtitle">{t("splash.subtitle")}</p>
        <div className="splash-spinner" />
        <p className="splash-loading">{t("splash.starting")}</p>
        <small className="splash-attribution">
          {t("settings.attribution")}
        </small>
      </div>
    </div>
  );
}

export default SplashScreen;
