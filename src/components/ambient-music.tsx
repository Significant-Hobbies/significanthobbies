'use client';

import { useEffect, useRef, useState } from 'react';
import { Music, Music2 } from 'lucide-react';

// ─── Ambient music player ───────────────────────────────────────────────────
// Generates calming ambient tones using the Web Audio API.
// No external files needed — everything is synthesized in-browser.
//
// The sound is a gentle drone pad: 3 sine waves at calming frequencies
// (a major chord) with slow volume modulation and a low-pass filter.
// It fades in/out smoothly. No sudden changes.

const CALMING_FREQUENCIES = [196.0, 261.63, 329.63]; // G3, C4, E4 — C major chord

export function AmbientMusic({ className = '' }: { className?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainRef = useRef<GainNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);

  function startMusic() {
    if (audioCtxRef.current) return; // Already playing

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    // Master gain — fades in smoothly
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 3); // 3s fade in
    masterGain.connect(ctx.destination);
    gainRef.current = masterGain;

    // Low-pass filter for warmth
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.setValueAtTime(0.5, ctx.currentTime);
    filter.connect(masterGain);

    // Create 3 oscillators (the chord)
    const oscs: OscillatorNode[] = [];
    for (let i = 0; i < CALMING_FREQUENCIES.length; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(CALMING_FREQUENCIES[i]!, ctx.currentTime);

      // Slight detune for richness
      osc.detune.setValueAtTime((i - 1) * 5, ctx.currentTime);

      // Individual gain for each oscillator (slightly different volumes)
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.3 - i * 0.05, ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
      oscs.push(osc);
    }
    oscillatorsRef.current = oscs;

    // LFO for slow volume modulation (breathing effect)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // Very slow — 12.5s cycle

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.02, ctx.currentTime); // Subtle modulation

    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);
    lfo.start();
    lfoRef.current = lfo;
    lfoGainRef.current = lfoGain;

    setIsPlaying(true);
  }

  function stopMusic() {
    const ctx = audioCtxRef.current;
    const gain = gainRef.current;
    if (!ctx || !gain) return;

    // Fade out smoothly over 2 seconds
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);

    // Stop oscillators after fade out
    setTimeout(() => {
      for (const osc of oscillatorsRef.current) {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // Already stopped
        }
      }
      try {
        lfoRef.current?.stop();
        lfoRef.current?.disconnect();
      } catch {
        // Already stopped
      }
      oscillatorsRef.current = [];
      lfoRef.current = null;
      lfoGainRef.current = null;
      gainRef.current = null;
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
    }, 2200);

    setIsPlaying(false);
  }

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      const ctx = audioCtxRef.current;
      if (ctx) {
        try {
          for (const osc of oscillatorsRef.current) {
            osc.stop();
            osc.disconnect();
          }
          lfoRef.current?.stop();
          lfoRef.current?.disconnect();
          ctx.close();
        } catch {
          // Already closed
        }
      }
    };
  }, []);

  return (
    <button
      onClick={isPlaying ? stopMusic : startMusic}
      className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
        isPlaying
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-border bg-card/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
      } ${className}`}
      aria-label={isPlaying ? 'Pause ambient music' : 'Play ambient music'}
    >
      {isPlaying ? (
        <Music2 className="h-3.5 w-3.5 animate-pulse" />
      ) : (
        <Music className="h-3.5 w-3.5" />
      )}
      <span>{isPlaying ? 'Ambient on' : 'Ambient'}</span>
    </button>
  );
}
