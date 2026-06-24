import { useCallback, useRef } from 'react';
import { AUDIO } from '../config/assets';

// Owns every audio element that isn't tied to a specific video clip:
// looping background music, the typewriter tick, the finale's romance track,
// and the "next" page blip. Returns the refs to mount plus a tidy set of play
// helpers so components never poke at audio elements directly.
export function useAudio() {
  const bgMusicRef = useRef(null);
  const typewriterRef = useRef(null);
  const romanceRef = useRef(null);
  const nextRef = useRef(null);

  const playMusic = useCallback((src, volume = 0.3) => {
    const el = bgMusicRef.current;
    if (!el) return;
    el.src = src;
    el.volume = volume;
    el.loop = true;
    el.load();
    el.play().catch(() => {});
  }, []);

  const stopMusic = useCallback(() => {
    if (!bgMusicRef.current) return;
    bgMusicRef.current.pause();
    bgMusicRef.current.currentTime = 0;
  }, []);

  // The tick lives a couple seconds into the file; seek there each keystroke.
  const playTypewriterTick = useCallback(() => {
    const el = typewriterRef.current;
    if (!el) return;
    el.currentTime = 2;
    el.volume = 0.5;
    el.play().catch(() => {});
  }, []);

  const startRomance = useCallback(() => {
    const el = romanceRef.current;
    if (!el) return;
    el.src = AUDIO.romance;
    el.volume = 0.4;
    el.loop = true;
    el.load();
    el.play().catch(() => {});
  }, []);

  const stopRomance = useCallback(() => {
    if (!romanceRef.current) return;
    romanceRef.current.pause();
    romanceRef.current.currentTime = 0;
  }, []);

  const playNext = useCallback(() => {
    const el = nextRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.volume = 0.5;
    el.play().catch(() => {});
  }, []);

  const resetAudio = useCallback(() => {
    stopMusic();
    stopRomance();
  }, [stopMusic, stopRomance]);

  return {
    bgMusicRef,
    typewriterRef,
    romanceRef,
    nextRef,
    playMusic,
    stopMusic,
    playTypewriterTick,
    startRomance,
    stopRomance,
    playNext,
    resetAudio,
  };
}
