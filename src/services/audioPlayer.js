import TTSEngine from "../tts/TTSEngine";

const urlMap = new Map();

function revokeUrl(key) {
  const old = urlMap.get(key);
  if (old) {
    URL.revokeObjectURL(old);
  }
}

export async function playAudioBlob(blob, fallbackText) {
  try {
    const audio = new Audio();
    const url = URL.createObjectURL(blob);
    audio.src = url;

    return new Promise((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        console.warn("[audioPlayer] Audio playback failed, falling back to TTS");
        TTSEngine.speak(fallbackText);
        resolve();
      };
      audio.play().catch(() => {
        URL.revokeObjectURL(url);
        console.warn("[audioPlayer] Audio play() rejected, falling back to TTS");
        TTSEngine.speak(fallbackText);
        resolve();
      });
    });
  } catch (e) {
    console.warn("[audioPlayer] Error playing audio, falling back to TTS:", e);
    TTSEngine.speak(fallbackText);
  }
}
