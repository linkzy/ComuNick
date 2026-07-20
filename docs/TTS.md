# TTS (Text-to-Speech)

## Dual Provider Architecture

ComuNick supports two TTS engines, selectable via the `ttsProvider` setting in AdminPanel:

| Provider     | Quality | Internet Required | Latency         | Cost |
|-------------|---------|------------------|-----------------|------|
| Native TTS  | Medium  | No               | Instant (after warmup) | Free |
| Narrator TTS| High    | Yes              | ~1-3s generation | Free (API key) |

## Native TTS (Web Speech API) — Default

Speech synthesis uses the browser's `SpeechSynthesis` API, available in all modern browsers (Chrome, Edge, Firefox, Safari).

### Auto Voice by Language

When `speak()` is called, TTSEngine finds the first available voice whose `lang` starts with the current i18n language prefix. This replaces the old voice selector UI.

```js
// tts/TTSEngine.js — auto voice selection
_getVoiceForLang(lang) {
  if (!lang) return null;
  const prefix = lang.split("-")[0];
  const voices = speechSynthesis.getVoices();
  return voices.find((v) => v.lang.startsWith(prefix)) || null;
}
```

### Known Issue: Initial Delay

On Android devices, the Web Speech API has a 1-3 second delay on the **first** call. This happens because the TTS engine needs to be loaded into memory.

**Solution:** Automatic warmup on initialization via SplashScreen.

```js
warmup() {
  const u = new SpeechSynthesisUtterance("");
  u.volume = 0;
  u.rate = 1;
  u.onstart = () => { this.ready = true; };
  u.onerror = () => { setTimeout(() => this.warmup(), 500); };
  speechSynthesis.speak(u);
}
```

### Issue: speechSynthesis.cancel() on Android

On Chrome Android, if `speechSynthesis.cancel()` is called many times in sequence, the engine may stop responding. Solution: throttle cancel() calls to one per second.

```js
_cancelWithThrottle() {
  const now = Date.now();
  if (now - this._lastCancel < 1000) return;
  this._lastCancel = now;
  speechSynthesis.cancel();
}
```

### Issue: Ignored Utterance

On Chrome Android, very short utterances (1-2 words) may be ignored. Solution: add a space at the end and ensure volume > 0.

## Narrator TTS API (Premium)

Higher-quality, cloud-based TTS via Narrator TTS API at `https://narrator-tts.linkzy.dev`.

### Architecture

```
Client JS ──► /api/tts/synthesize ──► nginx/Vite proxy ──► Narrator API
                 (no API key)            (adds X-API-Key header)
```

The API key is **never** exposed to client-side JavaScript. The proxy (Vite dev or nginx prod) adds the `X-API-Key` request header at the infrastructure layer.

### Audio Cache

Generated MP3 audio is cached in IndexedDB (`audio_cache` store) so repeated taps on the same cell play instantly without re-generating.

**Cache key pattern:** `audio:${boardId}:${cellId}`

**Cache entry shape:**
```js
{
  id: "audio:board_principal:c1",
  audio: Blob,      // MP3 blob
  text: "Quero água",
  createdAt: 1712345678000
}
```

### Flow

```
1. Cell tapped with ttsProvider === "narrator"
2. Check audio_cache[cellKey]:
   a. Hit → playAudioBlob(blob, text)
      - Creates ObjectURL from blob
      - new Audio().play()
      - If playback fails → fallback to native speak()
   b. Miss → show LoaderOverlay
      - POST /api/tts/synthesize { text, return_format: "mp3" }
      - Save blob to audio_cache
      - Hide LoaderOverlay
      - playAudioBlob(blob, text)
      - If API error → fallback to native speak()
```

### CellEditor: Pre-generation

When saving a cell in AdminPanel with `ttsProvider === "narrator"`, the CellEditor pre-generates the audio immediately so the first user tap is instant.

## Settings

```js
// SettingsContext initial state
{
  ttsRate: 1.0,
  ttsPitch: 1.0,
  ttsProvider: "native",   // "native" | "narrator"
  // Voice is auto-selected by language — no ttsVoice setting
}
```

## TTS Best Practices

1. **Visual feedback first, sound later** — the cell should change appearance on tap regardless of TTS
2. **500ms debounce** — prevent multiple simultaneous utterances
3. **Cancel previous utterance** — if the child taps another cell while speech is playing, cancel and start the new one
4. **Volume always > 0** — utterances with volume 0 may be ignored during warmup, use volume 0.01
5. **Test in silent/vibrate mode** — the app should work even with the device in silent mode (Web Speech API ignores device mute)
6. **Audio cache check first** — saves API calls and network latency
7. **LoaderOverlay during generation** — prevents double-taps while audio is being generated
