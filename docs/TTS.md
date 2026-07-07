# TTS (Text-to-Speech) — TTSEngine

## Web Speech API (Default)

Speech synthesis uses the browser's `SpeechSynthesis` API, available in all modern browsers (Chrome, Edge, Firefox, Safari).

## Known Issue: Initial Delay

On Android devices, the Web Speech API has a 1-3 second delay on the **first** call. This happens because the TTS engine needs to be loaded into memory. Subsequent calls are instant.

**Solution:** Automatic warmup on initialization.

```js
// tts/TTSEngine.js
class TTSEngine {
  constructor() {
    this.ready = false;
    this.queue = [];
    this.speaking = false;
  }

  warmup() {
    try {
      const u = new SpeechSynthesisUtterance("");
      u.volume = 0;
      u.rate = 1;
      u.onstart = () => {
        this.ready = true;
      };
      u.onerror = () => {
        // Warmup failed, retry in 500ms
        setTimeout(() => this.warmup(), 500);
      };
      speechSynthesis.speak(u);
    } catch (e) {
      console.warn("TTS warmup failed:", e);
    }
  }

  speak(text, lang = null) {
    if (!text || text.trim() === "") return;

    if (!this.ready) {
      this.warmup();
      this.queue.push({ text, lang });
      return;
    }

    // Process queue first
    while (this.queue.length > 0) {
      const queued = this.queue.shift();
      this._speakNow(queued.text, queued.lang);
    }

    this._speakNow(text, lang);
  }

  _speakNow(text, lang) {
    // Cancel previous speech if still speaking
    speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang || i18next?.language || "pt-BR";
    u.rate = this.rate || 1.0;
    u.pitch = this.pitch || 1.0;

    // On some devices, short utterances are ignored
    // Add extra space at the end to ensure playback
    u.text = text + " ";

    u.onstart = () => { this.speaking = true; };
    u.onend = () => { this.speaking = false; };
    u.onerror = (e) => {
      this.speaking = false;
      console.warn("TTS error:", e);
    };

    speechSynthesis.speak(u);
  }
}

export default new TTSEngine();
```

## Issue: speechSynthesis.cancel() on Android

On Chrome Android, if `speechSynthesis.cancel()` is called many times in sequence, the engine may stop responding. Solution: throttle cancel() calls to one per second.

```js
_cancelWithThrottle() {
  const now = Date.now();
  if (now - this._lastCancel < 1000) return;
  this._lastCancel = now;
  speechSynthesis.cancel();
}
```

## Issue: Ignored Utterance

On Chrome Android, very short utterances (1-2 words) or quiet ones may be ignored. Solution: add a space at the end and ensure volume > 0.

## Brazilian Portuguese Voicing

On Chrome Android, the default pt-BR voice is usually "Google português do Brasil". The `speechSynthesis.getVoices()` API returns available voices. **Do not force voice selection** — let the browser choose the default for the specified `lang`.

```js
_getVoiceForLang(lang) {
  // Do not filter by specific voice to avoid silence
  // Just set the lang and let the browser choose
  return null;
}
```

## Fallback — External Provider (Future)

TTS should accept a configurable external provider, keeping native as fallback.

```js
// Future settings config:
{
  "ttsProvider": "native",     // "native" | "external"
  "ttsExternalUrl": "https://api.elevenlabs.io/v1/text-to-speech/...",
  "ttsExternalKey": "..."      // stored locally, never on server
}
```

```js
// Fallback strategy:
async speak(text, lang) {
  if (settings.ttsProvider === "external" && settings.ttsExternalUrl) {
    try {
      await this._speakExternal(text, lang);
      return;
    } catch (e) {
      console.warn("External TTS failed, falling back to native:", e);
      // fallback to native
    }
  }
  this._speakNative(text, lang);
}
```

## TTS Best Practices

1. **Visual feedback first, sound later** — the cell should change appearance on tap regardless of TTS
2. **500ms debounce** — prevent multiple simultaneous utterances
3. **Cancel previous utterance** — if the child taps another cell while speech is playing, cancel and start the new one
4. **Volume always > 0** — utterances with volume 0 may be ignored during warmup, use volume 0.01
5. **Test in silent/vibrate mode** — the app should work even with the device in silent mode (Web Speech API ignores device mute)
