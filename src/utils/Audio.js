export class Audio {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.initialized = false;
    this.musicOscillators = [];
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.6;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.15;
      this.musicGain.connect(this.masterGain);

      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not available:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  createNoise(duration) {
    const sampleRate = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  play(name) {
    if (!this.initialized) this.init();
    if (!this.ctx) return;
    this.resume();

    switch (name) {
      case 'punch': this.playPunch(); break;
      case 'kick': this.playKick(); break;
      case 'special': this.playSpecial(); break;
      case 'block': this.playBlock(); break;
      case 'dodge': this.playDodge(); break;
      case 'combo': this.playCombo(); break;
      case 'finisher': this.playFinisher(); break;
      case 'menuSelect': this.playMenuSelect(); break;
      case 'levelComplete': this.playLevelComplete(); break;
      case 'gameOver': this.playGameOver(); break;
      case 'hit': this.playPunch(); break;
    }
  }

  playPunch() {
    const t = this.ctx.currentTime;
    // Lowpass noise for meaty impact
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoise(0.15);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.1);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    noise.connect(filter).connect(gain).connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + 0.15);

    // Bass sine for body thud
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.35, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    osc.connect(oscGain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  playKick() {
    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoise(0.2);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.15);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    noise.connect(filter).connect(gain).connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + 0.2);

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.15);
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.3, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc.connect(oscGain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  playSpecial() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.4);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, t);
    osc.connect(filter).connect(gain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.4);

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoise(0.2);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.01, t);
    nGain.gain.setValueAtTime(0.5, t + 0.15);
    nGain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
    noise.connect(nGain).connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + 0.35);
  }

  playBlock() {
    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoise(0.15);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    noise.connect(filter).connect(gain).connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + 0.15);
  }

  playDodge() {
    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoise(0.3);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, t);
    filter.frequency.exponentialRampToValueAtTime(3000, t + 0.15);
    filter.frequency.exponentialRampToValueAtTime(500, t + 0.3);
    filter.Q.value = 2;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    noise.connect(filter).connect(gain).connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + 0.3);
  }

  playCombo() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1600, t + 0.1);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc.connect(gain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  playFinisher() {
    const t = this.ctx.currentTime;
    [200, 300, 400].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, t + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
      osc.connect(gain).connect(this.sfxGain);
      osc.start(t + i * 0.05);
      osc.stop(t + 0.5);
    });
  }

  playMenuSelect() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(660, t + 0.05);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    osc.connect(gain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  playLevelComplete() {
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, t + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.15 + 0.4);
      osc.connect(gain).connect(this.sfxGain);
      osc.start(t + i * 0.15);
      osc.stop(t + i * 0.15 + 0.4);
    });
  }

  playGameOver() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 1.0);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 1.0);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 1.0);
    osc.connect(filter).connect(gain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 1.0);
  }

  startMusic(style = 'combat') {
    this.stopMusic();
    if (!this.initialized) this.init();
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;

    const drone = this.ctx.createOscillator();
    drone.type = 'sawtooth';
    drone.frequency.value = style === 'menu' ? 55 : 65;
    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 200;
    droneFilter.Q.value = 5;
    const droneGain = this.ctx.createGain();
    droneGain.gain.value = 0.3;
    drone.connect(droneFilter).connect(droneGain).connect(this.musicGain);
    drone.start(t);

    const sub = this.ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.value = style === 'menu' ? 27.5 : 32.7;
    const subGain = this.ctx.createGain();
    subGain.gain.value = 0.4;
    sub.connect(subGain).connect(this.musicGain);
    sub.start(t);

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = style === 'combat' ? 1.5 : 0.3;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 100;
    lfo.connect(lfoGain).connect(droneFilter.frequency);
    lfo.start(t);

    this.musicOscillators = [drone, sub, lfo];
  }

  stopMusic() {
    this.musicOscillators.forEach(osc => {
      try { osc.stop(); } catch (e) { /* already stopped */ }
    });
    this.musicOscillators = [];
  }

  setMusicVolume(vol) {
    if (this.musicGain) this.musicGain.gain.value = vol;
  }

  setSfxVolume(vol) {
    if (this.sfxGain) this.sfxGain.gain.value = vol;
  }

  dispose() {
    this.stopMusic();
    if (this.ctx) {
      this.ctx.close();
    }
  }
}

export const audio = new Audio();
