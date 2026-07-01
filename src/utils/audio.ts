// audio.ts: SE & BGM Controller with Web Audio API Fallback

class AudioController {
  private ctx: AudioContext | null = null;
  private seikaiAudio: HTMLAudioElement | null = null;
  private matigaiAudio: HTMLAudioElement | null = null;
  private bgmAudio: HTMLAudioElement | null = null;

  // Web Audio Synth BGM States
  private bgmIntervalId: any = null;
  private currentStep = 0;
  private synthTempoBpm = 110; // Base BPM
  private isBgmPlaying = false;

  constructor() {
    // Try preloading actual assets
    if (typeof window !== 'undefined') {
      this.seikaiAudio = new Audio('/public/seikai.mp3');
      this.matigaiAudio = new Audio('/public/matigai.mp3');
      this.bgmAudio = new Audio('/public/bgm.mp3');
      if (this.bgmAudio) {
        this.bgmAudio.loop = true;
      }
    }
  }

  // Ensure AudioContext is initialized on user gesture
  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    // Resume context if suspended (common in browsers)
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play Correct SE
  public playSeikai() {
    this.init();
    let playedWithAsset = false;

    if (this.seikaiAudio) {
      this.seikaiAudio.currentTime = 0;
      this.seikaiAudio.play()
        .then(() => {
          playedWithAsset = true;
        })
        .catch(() => {
          // If asset load fails, fallback to synth
          this.playSeikaiSynth();
        });
    } else {
      this.playSeikaiSynth();
    }

    // Set a tiny timeout to check if asset played, if not fallback
    setTimeout(() => {
      if (!playedWithAsset) {
        this.playSeikaiSynth();
      }
    }, 50);
  }

  private playSeikaiSynth() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      
      // Tone 1: 1000Hz
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1000, now);
      
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Tone 2: 1200Hz (slightly delayed to create "Pi-Peen!" effect)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1200, now + 0.08);
      
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(0.15, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      
      osc2.start(now + 0.08);
      osc2.stop(now + 0.26);
    } catch (e) {
      console.warn('Synth playback failed:', e);
    }
  }

  // Play Incorrect SE
  public playMatigai() {
    this.init();
    let playedWithAsset = false;

    if (this.matigaiAudio) {
      this.matigaiAudio.currentTime = 0;
      this.matigaiAudio.play()
        .then(() => {
          playedWithAsset = true;
        })
        .catch(() => {
          this.playMatigaiSynth();
        });
    } else {
      this.playMatigaiSynth();
    }

    setTimeout(() => {
      if (!playedWithAsset) {
        this.playMatigaiSynth();
      }
    }, 50);
  }

  private playMatigaiSynth() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      
      // Tone: Low buzzy sawtooth 150Hz decaying to 100Hz
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.35);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.36);
    } catch (e) {
      console.warn('Synth playback failed:', e);
    }
  }

  // Start Background BGM
  public startBgm() {
    this.init();
    this.isBgmPlaying = true;
    let playedWithAsset = false;

    if (this.bgmAudio) {
      this.bgmAudio.volume = 0.25;
      this.bgmAudio.play()
        .then(() => {
          playedWithAsset = true;
        })
        .catch(() => {
          this.startSynthBgm();
        });
    } else {
      this.startSynthBgm();
    }

    setTimeout(() => {
      if (!playedWithAsset && this.isBgmPlaying) {
        this.startSynthBgm();
      }
    }, 150);
  }

  // Stop BGM
  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
    }
    this.stopSynthBgm();
  }

  // Fast forward BGM / change tempo
  public setTempoMultiplier(phase: 1 | 2 | 3) {
    // Phase 1: Normal tempo (BPM 110)
    // Phase 2: Tempo up (BPM 130)
    // Phase 3: Ultra tempo up (BPM 160)
    let bpm = 110;
    let playbackRate = 1.0;
    
    if (phase === 2) {
      bpm = 135;
      playbackRate = 1.25;
    } else if (phase === 3) {
      bpm = 165;
      playbackRate = 1.5;
    }

    this.synthTempoBpm = bpm;

    // Apply playback rate if playing from audio asset
    if (this.bgmAudio) {
      this.bgmAudio.playbackRate = playbackRate;
    }

    // Restart synth loop with new BPM if synth is running
    if (this.bgmIntervalId) {
      this.stopSynthBgm();
      this.startSynthBgm();
    }
  }

  // Synth BGM Generator using Web Audio API (8-beat happy medical chip-tune synth)
  private startSynthBgm() {
    if (!this.ctx) return;
    if (this.bgmIntervalId) return;

    // Pentatonic scale notes to always sound "good" and upbeat (C major pentatonic: C4, D4, E4, G4, A4, C5)
    const notes = [
      261.63, // C4
      293.66, // D4
      329.63, // E4
      392.00, // G4
      440.00, // A4
      523.25, // C5
    ];

    // Simple happy techno melody sequencer (8 steps)
    // Pattern arrays representing indexes of 'notes' above. -1 is rest.
    const melodyPattern = [0, 2, 3, 2, 4, 3, 5, 4];
    const bassPattern = [0, 0, 3, 3, 4, 4, 3, 3]; // Bass root notes (one octave lower)

    const stepDuration = 60 / this.synthTempoBpm / 2; // Eighth notes

    const playStep = () => {
      if (!this.ctx || !this.isBgmPlaying) return;
      
      const now = this.ctx.currentTime;
      const step = this.currentStep % 8;

      // --- MELODY SYNTH LINE ---
      const noteIdx = melodyPattern[step];
      if (noteIdx !== -1) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle'; // Sweet retro tone
        osc.frequency.setValueAtTime(notes[noteIdx], now);
        
        // Slight lowpass filter for cleaner sound
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1500, now);

        // Soft, fast-decay envelope
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration - 0.02);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + stepDuration);
      }

      // --- BASS LINE ---
      if (step % 2 === 0) { // play on quarter notes
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        
        bassOsc.type = 'sine'; // Deep, warm bass
        bassOsc.frequency.setValueAtTime(notes[bassPattern[step]] / 2, now); // 1 octave down

        bassGain.gain.setValueAtTime(0, now);
        bassGain.gain.linearRampToValueAtTime(0.08, now + 0.02);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + (stepDuration * 2) - 0.02);

        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);

        bassOsc.start(now);
        bassOsc.stop(now + (stepDuration * 2));
      }

      // --- COMMICAL HI-HAT / BEAT ---
      if (step % 2 === 1) { // Up-beat hihat
        const noiseOsc = this.ctx.createOscillator();
        const noiseGain = this.ctx.createGain();
        
        // Simple synth hihat using a high-pass frequency
        noiseOsc.type = 'triangle';
        noiseOsc.frequency.setValueAtTime(8000, now);

        noiseGain.gain.setValueAtTime(0.01, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        noiseOsc.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        noiseOsc.start(now);
        noiseOsc.stop(now + 0.05);
      }

      this.currentStep++;
      
      // Schedule next step precisely
      const nextStepTimeMs = stepDuration * 1000;
      this.bgmIntervalId = setTimeout(playStep, nextStepTimeMs);
    };

    // Start loop
    this.currentStep = 0;
    playStep();
  }

  private stopSynthBgm() {
    if (this.bgmIntervalId) {
      clearTimeout(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }
}

export const audioController = new AudioController();
export default audioController;
