class TTSEngine {
  constructor() {
    this.ready = false;
    this.speaking = false;
    this.rate = 1.0;
    this.pitch = 1.0;
    this._utterance = null;
  }

  warmup() {
    if (this.ready) return;

    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      this.ready = true;
      return;
    }

    speechSynthesis.onvoiceschanged = () => {
      speechSynthesis.getVoices();
      this.ready = true;
      speechSynthesis.onvoiceschanged = null;
    };
  }

  speak(text) {
    if (!text || text.trim() === "") return;

    speechSynthesis.cancel();

    this._utterance = new SpeechSynthesisUtterance(text);
    this._utterance.rate = this.rate;
    this._utterance.pitch = this.pitch;

    this._utterance.onstart = () => { this.speaking = true; };
    this._utterance.onend = () => { this.speaking = false; };
    this._utterance.onerror = () => { this.speaking = false; };

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
