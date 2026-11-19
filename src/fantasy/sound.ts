let context: AudioContext | undefined;
export function menuSound(kind = "select", muted = false) {
  if (muted) return;
  try {
    context ||= new AudioContext();
    void context.resume();
    const t = context.currentTime;
    const notes =
      kind === "back"
        ? [660, 495, 330]
        : kind === "equip"
          ? [523, 784, 1047]
          : kind === "character"
            ? [440, 659, 880]
            : [740, 990];
    notes.forEach((frequency, i) => {
      const o = context!.createOscillator(),
        g = context!.createGain();
      o.type = "sine";
      o.frequency.value = frequency;
      o.connect(g);
      g.connect(context!.destination);
      g.gain.setValueAtTime(0, t + i * 0.045);
      g.gain.linearRampToValueAtTime(0.075, t + i * 0.045 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.045 + 0.12);
      o.start(t + i * 0.045);
      o.stop(t + i * 0.045 + 0.14);
    });
  } catch {}
}
