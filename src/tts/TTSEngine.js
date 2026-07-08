import i18n from "../i18n";

class TTSEngine {
  constructor() {
    this.ready = false;
    this.speaking = false;
    this.rate = 1.0;
    this.pitch = 1.0;
    this._utterance = null;
    this._readyCallbacks = [];
  }

  onReady(callback) {
    if (this.ready) {
      callback();
      return;
    }
    this._readyCallbacks.push(callback);
  }

  warmup() {
    if (this.ready) {
      console.log("[TTS] warmup skipped — already ready");
      this._flushReady();
      return;
    }

    console.log("[TTS] warmup starting — speechSynthesis available:", !!window.speechSynthesis);

    if (!window.speechSynthesis) {
      console.warn("[TTS] speechSynthesis NOT available");
      this._flushReady();
      return;
    }

    const voices = speechSynthesis.getVoices();
    console.log("[TTS] getVoices() returned", voices.length, "voices");

    if (voices.length > 0) {
      this.ready = true;
      console.log("[TTS] warmup complete —", voices.length, "voices loaded");
      this._flushReady();
      return;
    }

    console.log("[TTS] no voices yet — waiting for voiceschanged event");
    speechSynthesis.onvoiceschanged = () => {
      const v = speechSynthesis.getVoices();
      console.log("[TTS] voiceschanged event — got", v.length, "voices");
      this.ready = true;
      speechSynthesis.onvoiceschanged = null;
      this._flushReady();
    };
  }

  _flushReady() {
    const cbs = this._readyCallbacks.slice();
    this._readyCallbacks = [];
    cbs.forEach((cb) => cb());
  }

  getVoices() {
    if (!window.speechSynthesis) return [];
    return speechSynthesis.getVoices();
  }

  speak(text) {
    console.log("[TTS] speak() called with text:", JSON.stringify(text));
    console.log("[TTS] ready:", this.ready, "| speaking:", this.speaking);

    if (!text || text.trim() === "") {
      console.warn("[TTS] speak aborted — empty text");
      return;
    }

    console.log("[TTS] calling speechSynthesis.cancel()");
    speechSynthesis.cancel();

    this._utterance = new SpeechSynthesisUtterance(text);
    this._utterance.rate = this.rate;
    this._utterance.pitch = this.pitch;

    const voices = this.getVoices();
    const lang = (typeof i18n !== "undefined" && i18n.language) ? i18n.language : "pt-BR";
    const prefix = lang.split("-")[0];
    const match = voices.find((v) => v.lang && v.lang.startsWith(prefix));
    if (match) {
      this._utterance.voice = match;
      console.log("[TTS] auto-select voice:", match.name, `(${match.lang})`);
    }

    this._utterance.onstart = () => {
      console.log("[TTS] utterance onstart — speaking:", text);
      this.speaking = true;
    };
    this._utterance.onend = () => {
      console.log("[TTS] utterance onend");
      this.speaking = false;
    };
    this._utterance.onerror = (e) => {
      console.warn("[TTS] utterance onerror:", e.error, e.message);
      this.speaking = false;
    };

    console.log("[TTS] calling speechSynthesis.speak()");
    speechSynthesis.speak(this._utterance);
  }

  setRate(rate) {
    this.rate = rate;
  }

  setPitch(pitch) {
    this.pitch = pitch;
  }
}

export default new TTSEngine();
