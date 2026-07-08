class TTSEngine {
  constructor() {
    this.speaking = false;
    this.rate = 1.0;
    this.pitch = 1.0;
    this._timer = null;
  }

  speak(text) {
    if (!text || text.trim() === "") return;

    this._cancelAndSpeak(text);
  }

  _cancelAndSpeak(text) {
    speechSynthesis.cancel();

    if (this._timer) clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this._timer = null;
      const u = new SpeechSynthesisUtterance(text);
      u.rate = this.rate;
      u.pitch = this.pitch;

      u.onstart = () => { this.speaking = true; };
      u.onend = () => { this.speaking = false; };
      u.onerror = () => { this.speaking = false; };

      speechSynthesis.speak(u);
    }, 50);
  }

  setRate(rate) { this.rate = rate; }
  setPitch(pitch) { this.pitch = pitch; }
}

export default new TTSEngine();
