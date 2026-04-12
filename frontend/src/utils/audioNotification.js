// Facebook-style notification sound using Web Audio API
export const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Facebook-like notification tone (two beeps)
    const time = audioContext.currentTime;
    const duration = 0.1;

    // Oscillator 1
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();

    osc1.connect(gain1);
    gain1.connect(audioContext.destination);

    osc1.frequency.value = 800;
    osc1.type = "sine";

    gain1.gain.setValueAtTime(0.3, time);
    gain1.gain.exponentialRampToValueAtTime(0.01, time + duration);

    osc1.start(time);
    osc1.stop(time + duration);

    // Oscillator 2 (higher pitch)
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();

    osc2.connect(gain2);
    gain2.connect(audioContext.destination);

    osc2.frequency.value = 1200;
    osc2.type = "sine";

    gain2.gain.setValueAtTime(0.3, time + duration + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.01, time + duration + 0.15);

    osc2.start(time + duration + 0.05);
    osc2.stop(time + duration + 0.15);
  } catch (err) {
    console.log("Audio not supported");
  }
};
