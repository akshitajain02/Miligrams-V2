// Web Audio API Sound Synthesizer (Zero Dependencies, Instant & Crisp)
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playTone(freq = 440, type = 'sine', duration = 0.15, gainVal = 0.08) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignore any audio context blocking
    }
  }

  hover() {
    this.playTone(587.33, 'sine', 0.08, 0.03); // D5 soft blip
  }

  click() {
    this.playTone(880, 'triangle', 0.1, 0.06); // A5 crisp tap
  }

  questNext() {
    // Upbeat ascending chime
    this.playTone(523.25, 'sine', 0.12, 0.05);
    setTimeout(() => this.playTone(659.25, 'sine', 0.14, 0.06), 80);
    setTimeout(() => this.playTone(783.99, 'sine', 0.18, 0.07), 160);
  }

  questComplete() {
    // Celebratory victory chord
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.35, 0.08), idx * 75);
    });
  }
}

export const soundFX = new SoundFX();
