/**
 * Tiny synthesized sound engine (Web Audio API), no audio files required.
 * Everything is generated on the fly: mouse clicks, keyboard taps, a soft
 * boot chime and a very quiet room tone.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambient: { src: AudioBufferSourceNode; gain: GainNode } | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private _muted = false;
  private listeners = new Set<(muted: boolean) => void>();

  get muted() {
    return this._muted;
  }

  /** Must be called from a user gesture. */
  unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this._muted ? 0 : 0.8;
      this.master.connect(this.ctx.destination);
      this.noiseBuffer = this.makeNoise(2);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(muted: boolean) {
    this._muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    }
    this.listeners.forEach((l) => l(muted));
  }

  subscribe(listener: (muted: boolean) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private makeNoise(seconds: number) {
    const ctx = this.ctx!;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  private burst(freq: number, q: number, duration: number, volume: number) {
    if (!this.ctx || !this.master || !this.noiseBuffer || this._muted) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.playbackRate.value = 0.9 + Math.random() * 0.2;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = freq * (0.9 + Math.random() * 0.2);
    filter.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.connect(filter).connect(gain).connect(this.master);
    src.start(t, Math.random() * 1.5, duration + 0.02);
  }

  click() {
    this.burst(3200, 2.5, 0.035, 0.5);
    setTimeout(() => this.burst(2400, 3, 0.03, 0.25), 45);
  }

  key() {
    this.burst(1800 + Math.random() * 1200, 1.6, 0.05, 0.35);
  }

  /** Soft two-note chime played when the computer boots. */
  chime() {
    if (!this.ctx || !this.master || this._muted) return;
    const ctx = this.ctx;
    const notes = [523.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      const t = ctx.currentTime + i * 0.12;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      osc.connect(gain).connect(this.master!);
      osc.start(t);
      osc.stop(t + 1.5);
    });
  }

  /** Very quiet filtered room tone. */
  startAmbient() {
    if (!this.ctx || !this.master || !this.noiseBuffer || this.ambient) return;
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 380;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 3);
    src.connect(filter).connect(gain).connect(this.master);
    src.start();
    this.ambient = { src, gain };
  }
}

export const sound = new SoundEngine();
