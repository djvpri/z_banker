// src/hooks/useSound.ts
"use client";
import { useCallback, useRef } from "react";
import { useGameStore } from "@/store/gameStore";

type SoundEffect =
  | "coin"          // profit / deposit received
  | "click"         // button click
  | "approve"       // loan approved
  | "reject"        // action rejected
  | "alert"         // warning / event
  | "success"       // achievement / win
  | "danger"        // bad event / game over
  | "levelup"       // level up / upgrade
  | "nextday"       // advance day
  | "negotiate";    // negotiation

// We generate simple tones using Web Audio API instead of audio files
// This avoids needing to serve sound files
function createTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.3
): void {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      frequency * 0.7,
      ctx.currentTime + duration
    );

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio errors silently
  }
}

function playChord(frequencies: number[], duration: number, volume = 0.2): void {
  frequencies.forEach((f, i) => {
    setTimeout(() => createTone(f, duration, "sine", volume), i * 80);
  });
}

const SOUND_MAP: Record<SoundEffect, () => void> = {
  coin:      () => playChord([523, 659, 784], 0.3, 0.25),
  click:     () => createTone(800, 0.08, "square", 0.1),
  approve:   () => playChord([392, 523, 659], 0.4, 0.2),
  reject:    () => createTone(200, 0.3, "sawtooth", 0.2),
  alert:     () => { createTone(440, 0.2, "triangle", 0.3); setTimeout(() => createTone(440, 0.2, "triangle", 0.3), 300); },
  success:   () => playChord([523, 659, 784, 1047], 0.5, 0.25),
  danger:    () => playChord([220, 165, 110], 0.6, 0.3),
  levelup:   () => playChord([523, 659, 784, 1047, 1319], 0.5, 0.3),
  nextday:   () => createTone(600, 0.15, "sine", 0.15),
  negotiate: () => playChord([440, 550], 0.3, 0.2),
};

export function useSound() {
  const isMuted = useGameStore((s) => s.isMuted);

  const play = useCallback((effect: SoundEffect) => {
    if (isMuted) return;
    SOUND_MAP[effect]?.();
  }, [isMuted]);

  return { play };
}
