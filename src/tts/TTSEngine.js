class TTSEngine {
  constructor() {
    this.ready = false;
    this.queue = [];
    this.speaking = false;
    this._lastCancel = 0;
    this.rate = 1.0;
    this.pitch = 1.0;
  }

  warmup() {
    try {
      const u = new SpeechSynthesisUtterance("");
      u.volume = 0.01;
      u.rate = 1;
      u.onstart = () => {
        this.ready = true;
      };
      u.onerror = () => {
        setTimeout(() => this.warmup(), 500);
      };
      speechSynthesis.speak(u);
    } catch (e) {
      console.warn("TTS warmup failed:", e);
    }
  }

  speak(text) {
    if (!text || text.trim() === "") return;

    if (!this.ready) {
      this.warmup();
      this.queue.push({ text });
      return;
    }

    while (this.queue.length > 0) {
      const queued = this.queue.shift();
      this._speakNow(queued.text);
    }

    this._speakNow(text);
  }

  _speakNow(text) {
    this._cancelWithThrottle();

    const u = new SpeechSynthesisUtterance(text);
    u.rate = this.rate;
    u.pitch = this.pitch;
    u.text = text + " ";

    u.onstart = () => {
      this.speaking = true;
    };
    u.onend = () => {
      this.speaking = false;
    };
    u.onerror = (e) => {
      this.speaking = false;
      console.warn("TTS error:", e);
    };

    speechSynthesis.speak(u);
  }

  _cancelWithThrottle() {
    const now = Date.now();
    if (now - this._lastCancel < 1000) return;
    this._lastCancel = now;
    speechSynthesis.cancel();
  }

  setRate(rate) {
    this.rate = rate;
  }

  setPitch(pitch) {
    this.pitch = pitch;
  }
}

export default new TTSEngine();
