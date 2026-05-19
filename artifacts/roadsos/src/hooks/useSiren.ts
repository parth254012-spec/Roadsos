import { useRef, useCallback } from "react";

export function useSiren() {
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const play = useCallback(() => {
    try {
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);

      oscRef.current = osc;
      gainRef.current = gain;

      osc.start();

      // Continuously modulate pitch for wailing siren
      let start = ctx.currentTime;
      const modulate = () => {
        if (!ctxRef.current || !oscRef.current) return;
        const t = ctxRef.current.currentTime;
        const elapsed = (t - start) % 1.2;
        const freq = elapsed < 0.6
          ? 700 + (600 * (elapsed / 0.6))
          : 1300 - (600 * ((elapsed - 0.6) / 0.6));
        oscRef.current.frequency.setValueAtTime(freq, t);
        rafRef.current = requestAnimationFrame(modulate);
      };
      rafRef.current = requestAnimationFrame(modulate);
    } catch {
      // Audio unavailable (e.g. sandboxed iframe)
    }
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (oscRef.current) {
      try { oscRef.current.stop(); } catch {}
      oscRef.current = null;
    }
    if (ctxRef.current) {
      try { ctxRef.current.close(); } catch {}
      ctxRef.current = null;
    }
  }, []);

  return { play, stop };
}
