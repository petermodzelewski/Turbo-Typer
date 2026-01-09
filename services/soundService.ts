import { SpecialType, Theme } from "../types";

class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  
  // Music nodes
  private musicGain: GainNode | null = null;
  
  // Generative Music State
  private ambientInterval: ReturnType<typeof setInterval> | null = null;
  private activeAmbientNodes: { osc: OscillatorNode; gain: GainNode; panner?: StereoPannerNode }[] = [];

  constructor() {
    // AudioContext handles are often restricted until user interaction
  }

  // Must be called on a user gesture (e.g. Start Game button)
  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.3; // Default SFX volume

      // Separate gain for music to keep it subtle
      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.ctx.destination);
      this.musicGain.gain.value = 0.0; // Start silent
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.ctx) {
      const now = this.ctx.currentTime;
      // Mute SFX
      if (this.masterGain) {
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.3, now);
      }
      // Mute Music
      if (this.musicGain) {
         this.musicGain.gain.cancelScheduledValues(now);
         // Mute immediately or restore to target volume
         const targetVol = 0.08; // Reduced global music volume
         this.musicGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : targetVol, now + 1.0);
      }
    }
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }

  // --- AMBIENT MUSIC ENGINE (Generative) ---

  startAmbientMusic(theme: Theme) {
    if (!this.ctx) this.init(); 
    if (!this.ctx || !this.musicGain) return;
    
    // Stop any existing generation
    this.stopAmbientMusic(false);

    const now = this.ctx.currentTime;
    
    // Fade in master music gain
    if (!this.isMuted) {
        this.musicGain.gain.cancelScheduledValues(now);
        this.musicGain.gain.setValueAtTime(0, now);
        // TARGET VOLUME REDUCED to 0.08 (Very subtle)
        this.musicGain.gain.linearRampToValueAtTime(0.08, now + 5); 
    }

    // Start the generator loop
    // Spawns a new note every 2.5 - 4 seconds to create an evolving texture
    this.spawnAmbientNote(theme); // Immediate first note
    this.ambientInterval = setInterval(() => {
        if (!this.isMuted) {
            this.spawnAmbientNote(theme);
        }
    }, 3500);
  }

  stopAmbientMusic(fadeOut: boolean = true) {
    if (!this.ctx || !this.musicGain) return;
    
    // Stop generating new notes
    if (this.ambientInterval) {
        clearInterval(this.ambientInterval);
        this.ambientInterval = null;
    }

    const now = this.ctx.currentTime;

    if (fadeOut) {
        // Fade out master
        this.musicGain.gain.cancelScheduledValues(now);
        this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
        this.musicGain.gain.linearRampToValueAtTime(0, now + 2);

        // Cleanup nodes after fade
        setTimeout(() => {
             this.cleanupNodes();
        }, 2100);
    } else {
        this.cleanupNodes();
    }
  }

  private cleanupNodes() {
      this.activeAmbientNodes.forEach(node => {
          try {
              node.osc.stop();
              node.osc.disconnect();
              node.gain.disconnect();
              if (node.panner) node.panner.disconnect();
          } catch(e) {}
      });
      this.activeAmbientNodes = [];
  }

  private spawnAmbientNote(theme: Theme) {
      if (!this.ctx || !this.musicGain) return;

      // 1. Determine Scale and Instrument based on Theme
      let freqs: number[] = [];
      let wave: OscillatorType = 'sine';
      let duration = 6; // Seconds
      let baseOctave = 1;

      switch(theme) {
          case 'space':
              // C Minor Pentatonic (Low, airy)
              freqs = [130.81, 155.56, 174.61, 196.00, 233.08]; // C3 range
              wave = 'sine';
              duration = 8;
              break;
          case 'animals':
              // C Major Pentatonic (Bright, nature-like)
              freqs = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C4 range
              wave = 'triangle';
              duration = 5;
              break;
          case 'percy':
              // A Dorian (Ancient, mysterious)
              freqs = [220.00, 246.94, 261.63, 293.66, 329.63, 369.99, 392.00]; // A3 range
              wave = 'triangle'; 
              duration = 7;
              break;
          case 'potter':
              // E Lydian/Magical (Sparkly)
              freqs = [329.63, 392.00, 415.30, 493.88, 622.25]; // E4 range with sharps
              wave = 'sine';
              duration = 6;
              break;
      }

      // Pick a random frequency from the scale
      const freq = freqs[Math.floor(Math.random() * freqs.length)];
      
      // 2. Create Nodes
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      
      // Add Stereo Panning for movement (if supported)
      let panner: StereoPannerNode | undefined;
      if (this.ctx.createStereoPanner) {
          panner = this.ctx.createStereoPanner();
          // Pan randomly between -0.7 (Left) and 0.7 (Right)
          panner.pan.value = (Math.random() * 1.4) - 0.7;
          osc.connect(noteGain);
          noteGain.connect(panner);
          panner.connect(this.musicGain);
      } else {
          osc.connect(noteGain);
          noteGain.connect(this.musicGain);
      }

      // 3. Configure Sound
      osc.type = wave;
      osc.frequency.value = freq;

      // Slight detune for organic feel
      osc.detune.value = (Math.random() * 10) - 5; 

      const now = this.ctx.currentTime;
      const attack = duration * 0.4; // Slow fade in
      const release = duration * 0.6; // Slow fade out

      // 4. Envelope (The "Breathing" Effect)
      noteGain.gain.setValueAtTime(0, now);
      // Fade in to low volume (so layers don't get too loud)
      const maxVol = theme === 'space' ? 0.3 : 0.15; 
      noteGain.gain.linearRampToValueAtTime(maxVol, now + attack);
      // Fade out to 0
      noteGain.gain.linearRampToValueAtTime(0, now + duration);

      // 5. Start/Stop
      osc.start(now);
      osc.stop(now + duration + 1); // Buffer time

      // Track active node for cleanup
      const nodeObj = { osc, gain: noteGain, panner };
      this.activeAmbientNodes.push(nodeObj);

      // Remove from array when done to keep memory clean
      setTimeout(() => {
          const idx = this.activeAmbientNodes.indexOf(nodeObj);
          if (idx > -1) this.activeAmbientNodes.splice(idx, 1);
      }, (duration + 1) * 1000);
  }


  // --- SFX HELPERS ---

  private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0) {
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Theme-based modulation
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
    
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(this.ctx.currentTime + startTime);
    osc.stop(this.ctx.currentTime + startTime + duration);
  }

  // --- PUBLIC SFX METHODS ---

  playUIHover() {
    // Very short, high pitch blip for hover
    if (!this.ctx || this.isMuted || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.linearRampToValueAtTime(1000, t + 0.05);
    
    gain.gain.setValueAtTime(0.03, t); // Very quiet
    gain.gain.linearRampToValueAtTime(0, t + 0.05);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(t);
    osc.stop(t + 0.05);
  }

  playUIClick() {
    // Generic UI interaction click
    if (!this.ctx || this.isMuted || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.1);
    
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(t);
    osc.stop(t + 0.1);
  }

  playClick(theme: Theme) {
    if (!this.ctx || this.isMuted || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    switch(theme) {
        case 'space': // Laser blip
            osc.frequency.setValueAtTime(800, t);
            osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);
            osc.type = 'square';
            break;
        case 'animals': // Woodblock/Click
            osc.frequency.setValueAtTime(600, t);
            osc.type = 'triangle';
            break;
        case 'percy': // Metallic ting
            osc.frequency.setValueAtTime(1200, t);
            osc.frequency.exponentialRampToValueAtTime(1000, t + 0.1);
            osc.type = 'triangle';
            break;
        case 'potter': // Magic sparkle
            osc.frequency.setValueAtTime(1500, t);
            osc.type = 'sine';
            break;
    }
    
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  playError(theme: Theme) {
    // Low buzzer or thud
    if (!this.ctx || this.isMuted) return;
    this.playTone(100, 'sawtooth', 0.2);
  }

  playExplosion(large: boolean = false, theme: Theme) {
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * (large ? 1.0 : 0.5);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    
    // Theme specific explosion characteristics
    if (theme === 'potter') {
        noiseFilter.type = 'highpass'; // Magical sizzle
        noiseFilter.frequency.setValueAtTime(500, t);
        noiseFilter.frequency.linearRampToValueAtTime(2000, t + 0.5);
    } else {
        noiseFilter.type = 'lowpass'; // Standard boom
        noiseFilter.frequency.setValueAtTime(1000, t);
        noiseFilter.frequency.linearRampToValueAtTime(100, t + (large ? 0.5 : 0.2));
    }

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(large ? 0.4 : 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + (large ? 0.5 : 0.2));

    noise.connect(noiseFilter);
    noiseFilter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
  }

  playPowerUp(type: SpecialType, theme: Theme) {
    if (!this.ctx || this.isMuted) return;
    
    switch (type) {
      case 'heart':
        this.playTone(880, 'sine', 0.2, 0);
        this.playTone(1108, 'sine', 0.4, 0.1);
        break;
      case 'shield':
        if (this.masterGain) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.setValueAtTime(200, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.5);
            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.5);
        }
        break;
      case 'bomb':
        this.playExplosion(true, theme);
        break;
      case 'multiplier':
        this.playTone(440, 'triangle', 0.1, 0);
        this.playTone(554, 'triangle', 0.1, 0.1);
        this.playTone(659, 'triangle', 0.1, 0.2);
        this.playTone(880, 'triangle', 0.2, 0.3);
        break;
      case 'freeze':
        if (this.masterGain) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(2000, this.ctx.currentTime);
            
            const lfo = this.ctx.createOscillator();
            lfo.frequency.value = 10;
            const lfoGain = this.ctx.createGain();
            lfoGain.gain.value = 0.5; 
            
            lfo.connect(lfoGain);
            lfoGain.connect(gain.gain);
            
            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start();
            lfo.start();
            osc.stop(this.ctx.currentTime + 0.5);
            lfo.stop(this.ctx.currentTime + 0.5);
        }
        break;
    }
  }

  playLevelUp(theme: Theme) {
    this.playTone(440, 'square', 0.1, 0);
    this.playTone(440, 'square', 0.1, 0.1);
    this.playTone(440, 'square', 0.1, 0.2);
    this.playTone(587, 'square', 0.6, 0.3);
  }

  playGameOver(theme: Theme) {
    const wave = theme === 'potter' ? 'sine' : theme === 'percy' ? 'triangle' : 'sawtooth';
    this.playTone(400, wave, 0.3, 0);
    this.playTone(350, wave, 0.3, 0.3);
    this.playTone(300, wave, 0.3, 0.6);
    this.playTone(250, wave, 1.0, 0.9);
  }
}

export const soundService = new SoundService();