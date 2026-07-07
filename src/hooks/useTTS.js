import { useCallback } from "react";
import TTSEngine from "../tts/TTSEngine";

export function useTTS() {
  const speak = useCallback((text) => {
    TTSEngine.speak(text);
  }, []);

  return { speak, isReady: TTSEngine.ready };
}
