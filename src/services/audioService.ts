
export class GameAudio {
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private driftOsc: OscillatorNode | null = null;
  private driftGain: GainNode | null = null;
  private music: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private initialized: boolean = false;

  constructor() {
    // Audio context is created on first interaction
  }

  public init() {
    if (this.initialized) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Engine Sound
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = 0;
    this.engineOsc.connect(this.engineGain);
    this.engineGain.connect(this.ctx.destination);
    this.engineOsc.start();

    // Drift Sound (Noise)
    this.driftGain = this.ctx.createGain();
    this.driftGain.gain.value = 0;
    this.driftGain.connect(this.ctx.destination);
    
    // Create noise buffer for drift
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    noise.connect(this.driftGain);
    noise.start();

    // Background Music
    this.music = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'); // Placeholder upbeat track
    this.music.loop = true;
    this.music.volume = 0.3;

    this.initialized = true;
  }

  public update(speedPercent: number, isDrifting: boolean, isBraking: boolean) {
    if (!this.initialized || !this.ctx || this.isMuted) return;

    // Update Engine Pitch
    if (this.engineOsc && this.engineGain) {
      const baseFreq = 50;
      const targetFreq = baseFreq + (speedPercent * 150);
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
      this.engineGain.gain.setTargetAtTime(0.1 + (speedPercent * 0.1), this.ctx.currentTime, 0.1);
    }

    // Update Drift/Brake Sound
    if (this.driftGain) {
      const targetGain = (isDrifting || (isBraking && speedPercent > 0.1)) ? 0.15 : 0;
      this.driftGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    }
  }

  public playCollision(impact: number) {
    if (!this.initialized || !this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(impact * 0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  public playTurbo() {
    if (!this.initialized || !this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  public startMusic() {
    if (this.music && !this.isMuted) {
      this.music.play().catch(e => console.log("Music play blocked", e));
    }
  }

  public stopMusic() {
    if (this.music) {
      this.music.pause();
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.engineGain) this.engineGain.gain.value = 0;
      if (this.driftGain) this.driftGain.gain.value = 0;
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.isMuted;
  }
}

export const audioManager = new GameAudio();
