
export class GameAudio {
  private ctx: AudioContext | null = null;
  private engineAudio: HTMLAudioElement | null = null;
  private driftAudio: HTMLAudioElement | null = null;
  private turboAudio: HTMLAudioElement | null = null;
  private collisionAudio: HTMLAudioElement | null = null;
  private music: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private initialized: boolean = false;

  constructor() {
    // Audio context is created on first interaction
  }

  public init() {
    if (this.initialized) return;
    
    // Engine Sound - Loopable high-quality engine
    this.engineAudio = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_884d974478.mp3');
    this.engineAudio.loop = true;
    this.engineAudio.volume = 0;

    // Drift Sound
    this.driftAudio = new Audio('https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a0a0a0.mp3');
    this.driftAudio.loop = true;
    this.driftAudio.volume = 0;

    // Turbo Sound
    this.turboAudio = new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_12b5443d3a.mp3');
    this.turboAudio.volume = 0.4;

    // Collision Sound
    this.collisionAudio = new Audio('https://cdn.pixabay.com/audio/2022/03/10/audio_730626391d.mp3');
    this.collisionAudio.volume = 0.5;

    // Background Music
    this.music = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3');
    this.music.loop = true;
    this.music.volume = 0.2;

    this.initialized = true;
  }

  public update(speedPercent: number, isDrifting: boolean, isBraking: boolean) {
    if (!this.initialized || this.isMuted) return;

    // Update Engine Sound
    if (this.engineAudio) {
      if (this.engineAudio.paused) {
        this.engineAudio.play().catch(() => {});
      }
      // Pitch shifting engine based on speed
      this.engineAudio.playbackRate = 0.5 + (speedPercent * 1.5);
      this.engineAudio.volume = 0.1 + (speedPercent * 0.4);
    }

    // Update Drift/Brake Sound
    if (this.driftAudio) {
      const shouldPlayDrift = isDrifting || (isBraking && speedPercent > 0.2);
      if (shouldPlayDrift) {
        if (this.driftAudio.paused) {
          this.driftAudio.play().catch(() => {});
        }
        this.driftAudio.volume = 0.3;
      } else {
        this.driftAudio.volume = 0;
        if (!this.driftAudio.paused) {
          this.driftAudio.pause();
        }
      }
    }
  }

  public playCollision(impact: number) {
    if (!this.initialized || this.isMuted || !this.collisionAudio) return;
    const sound = this.collisionAudio.cloneNode() as HTMLAudioElement;
    sound.volume = Math.min(1, impact * 2);
    sound.play().catch(() => {});
  }

  public playTurbo() {
    if (!this.initialized || this.isMuted || !this.turboAudio) return;
    const sound = this.turboAudio.cloneNode() as HTMLAudioElement;
    sound.play().catch(() => {});
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
      if (this.engineAudio) this.engineAudio.volume = 0;
      if (this.driftAudio) this.driftAudio.volume = 0;
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.isMuted;
  }
}

export const audioManager = new GameAudio();
