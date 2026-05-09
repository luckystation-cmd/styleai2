export const playSound = (type: 'scan' | 'success' | 'click' | 'error') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTone = (frequency: number, type: OscillatorType, duration: number, vol = 0.1, startTime = ctx.currentTime) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, startTime);
      
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    if (type === 'scan') {
      // Techy scanning sound
      playTone(400, 'square', 0.1, 0.05);
      playTone(600, 'square', 0.1, 0.05, ctx.currentTime + 0.1);
      playTone(800, 'sine', 0.3, 0.05, ctx.currentTime + 0.2);
    } else if (type === 'success') {
      // Pleasant chime
      playTone(523.25, 'sine', 0.2, 0.1); // C5
      playTone(659.25, 'sine', 0.2, 0.1, ctx.currentTime + 0.1); // E5
      playTone(783.99, 'sine', 0.4, 0.1, ctx.currentTime + 0.2); // G5
    } else if (type === 'click') {
      // Short click
      playTone(800, 'sine', 0.05, 0.05);
    } else if (type === 'error') {
      // Buzz
      playTone(150, 'sawtooth', 0.3, 0.1);
      playTone(100, 'sawtooth', 0.3, 0.1, ctx.currentTime + 0.2);
    }
  } catch (e) {
    // Ignore audio errors silently
  }
};
