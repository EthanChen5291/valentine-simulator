import { useCallback, useEffect, useRef, useState } from 'react';

const MIN_DELAY = 40;
const JITTER = 40;

// Types out a string one character at a time with a slightly random cadence so
// it reads like a real keystroke rhythm rather than a metronome. Fires onTick
// per character and, once finished, flips `ready` after a short beat.
export function useTypewriter(text, { onTick, readyDelay = 500 } = {}) {
  const [index, setIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [ready, setReady] = useState(false);

  const charTimer = useRef(null);
  const readyTimer = useRef(null);

  const clear = useCallback(() => {
    clearTimeout(charTimer.current);
    clearTimeout(readyTimer.current);
  }, []);

  const reset = useCallback(() => {
    clear();
    setIndex(0);
    setIsComplete(false);
    setReady(false);
  }, [clear]);

  const start = useCallback(() => {
    reset();
    let i = 0;

    const typeNext = () => {
      i += 1;
      setIndex(i);
      onTick?.();

      if (i >= text.length) {
        setIsComplete(true);
        readyTimer.current = setTimeout(() => setReady(true), readyDelay);
      } else {
        charTimer.current = setTimeout(typeNext, MIN_DELAY + Math.random() * JITTER);
      }
    };

    charTimer.current = setTimeout(typeNext, MIN_DELAY + Math.random() * JITTER);
  }, [reset, onTick, text, readyDelay]);

  useEffect(() => clear, [clear]);

  return { index, isComplete, ready, start, reset };
}
