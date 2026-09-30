// Selvan Super Market - Advanced Audio Engine & Music
// Synthesizes realistic supermarket Sound FX (including real Cash Register Ka-Ching!) and soothing ambient shopping music

class SupermarketAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.musicPlaying = false;
    this.soundEffectsEnabled = true;
    this.musicTimer = null;
    this.masterMusicGain = null;
    this.currentStep = 0;
    this.musicVolume = 0.08; // Pleasant background volume
  }

  // Initialize Audio Context on user interaction
  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Toggle Sound Effects (ON/OFF)
  toggleSoundEffects() {
    this.soundEffectsEnabled = !this.soundEffectsEnabled;
    return this.soundEffectsEnabled;
  }

  // Button Hover / Click Pop
  playClick() {
    if (!this.soundEffectsEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const now = this.audioCtx.currentTime;

    osc.type = "sine";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.06);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Realistic Cash Register "Ka-Ching!" Sound Effect
  playCashRegister() {
    if (!this.soundEffectsEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;

    // 1. Initial metallic drawer mechanical click
    const clickOsc = this.audioCtx.createOscillator();
    const clickGain = this.audioCtx.createGain();
    clickOsc.type = "square";
    clickOsc.frequency.setValueAtTime(160, now);
    clickOsc.frequency.exponentialRampToValueAtTime(60, now + 0.05);
    clickGain.gain.setValueAtTime(0.12, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    clickOsc.connect(clickGain);
    clickGain.connect(this.audioCtx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.05);

    // 2. High Brass Bell Ring 1 (E6 - 1318Hz)
    const bell1 = this.audioCtx.createOscillator();
    const bellGain1 = this.audioCtx.createGain();
    bell1.type = "sine";
    bell1.frequency.setValueAtTime(1318.5, now + 0.06);
    bellGain1.gain.setValueAtTime(0.2, now + 0.06);
    bellGain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    bell1.connect(bellGain1);
    bellGain1.connect(this.audioCtx.destination);
    bell1.start(now + 0.06);
    bell1.stop(now + 0.45);

    // 3. High Brass Bell Ring 2 (B6 - 1975Hz shimmer)
    const bell2 = this.audioCtx.createOscillator();
    const bellGain2 = this.audioCtx.createGain();
    bell2.type = "triangle";
    bell2.frequency.setValueAtTime(1975.5, now + 0.1);
    bellGain2.gain.setValueAtTime(0.25, now + 0.1);
    bellGain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    bell2.connect(bellGain2);
    bellGain2.connect(this.audioCtx.destination);
    bell2.start(now + 0.1);
    bell2.stop(now + 0.7);
  }

  // Play Add To Cart Sound (Cash register chime)
  playAddToCart() {
    this.playCashRegister();
  }

  // Play Item Remove / Decrement
  playRemove() {
    if (!this.soundEffectsEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Joyful Triumphant Order Fanfare (WhatsApp Order Sent)
  playOrderFanfare() {
    if (!this.soundEffectsEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    // Celebratory melody: C5 -> E5 -> G5 -> B5 -> C6
    const melody = [
      { f: 523.25, t: 0, d: 0.1 },
      { f: 659.25, t: 0.1, d: 0.1 },
      { f: 783.99, t: 0.2, d: 0.12 },
      { f: 987.77, t: 0.32, d: 0.12 },
      { f: 1046.50, t: 0.44, d: 0.55 }
    ];

    const now = this.audioCtx.currentTime;
    melody.forEach(note => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(note.f, now + note.t);

      gain.gain.setValueAtTime(0.22, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + note.t);
      osc.stop(now + note.t + note.d);
    });
  }

  // Toggle Background Shopping Music
  toggleBackgroundMusic() {
    this.init();
    if (!this.audioCtx) return false;

    if (this.musicPlaying) {
      this.stopBackgroundMusic();
      return false;
    } else {
      this.startBackgroundMusic();
      return true;
    }
  }

  // Cheerful, Relaxing Supermarket Ambient Melody
  // Synthesizes electric piano chords + warm bass + soft bell arpeggio in F Major
  startBackgroundMusic() {
    this.musicPlaying = true;
    this.currentStep = 0;

    // Chord progressions (Fmaj7 -> Dm7 -> Gm7 -> C7)
    const progression = [
      { bass: 87.31, chord: [349.23, 440.00, 523.25, 659.25], lead: [659.25, 523.25] }, // Fmaj7
      { bass: 73.42, chord: [293.66, 349.23, 440.00, 523.25], lead: [440.00, 523.25] }, // Dm7
      { bass: 98.00, chord: [392.00, 466.16, 587.33, 698.46], lead: [587.33, 466.16] }, // Gm7
      { bass: 65.41, chord: [261.63, 329.63, 392.00, 466.16], lead: [523.25, 659.25] }  // C7
    ];

    if (!this.masterMusicGain) {
      this.masterMusicGain = this.audioCtx.createGain();
      this.masterMusicGain.gain.setValueAtTime(this.musicVolume, this.audioCtx.currentTime);
      this.masterMusicGain.connect(this.audioCtx.destination);
    }

    const playStep = () => {
      if (!this.musicPlaying || !this.audioCtx) return;

      const chordData = progression[this.currentStep % progression.length];
      this.currentStep++;
      const now = this.audioCtx.currentTime;

      // 1. Warm Soft Bass Note
      const bassOsc = this.audioCtx.createOscillator();
      const bassGain = this.audioCtx.createGain();
      bassOsc.type = "sine";
      bassOsc.frequency.setValueAtTime(chordData.bass, now);
      bassGain.gain.setValueAtTime(0.2, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      bassOsc.connect(bassGain);
      bassGain.connect(this.masterMusicGain);
      bassOsc.start(now);
      bassOsc.stop(now + 1.2);

      // 2. Polyphonic Electric Piano Chords
      chordData.chord.forEach((freq, idx) => {
        const noteTime = now + (idx * 0.12);
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const filter = this.audioCtx.createBiquadFilter();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, noteTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1100, noteTime);

        gain.gain.setValueAtTime(0.09, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 1.0);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterMusicGain);

        osc.start(noteTime);
        osc.stop(noteTime + 1.05);
      });

      // 3. Gentle Melodic Sparkle
      const leadNote = chordData.lead[(this.currentStep % 2)];
      const leadOsc = this.audioCtx.createOscillator();
      const leadGain = this.audioCtx.createGain();
      leadOsc.type = "sine";
      leadOsc.frequency.setValueAtTime(leadNote * 1.5, now + 0.6);
      leadGain.gain.setValueAtTime(0.07, now + 0.6);
      leadGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
      leadOsc.connect(leadGain);
      leadGain.connect(this.masterMusicGain);
      leadOsc.start(now + 0.6);
      leadOsc.stop(now + 1.15);

      // Schedule next chord in 1.35 seconds
      this.musicTimer = setTimeout(playStep, 1350);
    };

    playStep();
  }

  stopBackgroundMusic() {
    this.musicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

// Global audio instance
const soundEngine = new SupermarketAudioEngine();
