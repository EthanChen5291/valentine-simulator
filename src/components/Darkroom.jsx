import { useEffect } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';
import { TYPEWRITER_PROMPT } from '../config/script';

// After the third "no", the room goes dark and the question is finally asked
// outright. A beat of silence builds tension, then the prompt types itself out
// and the real yes / no buttons fade in.
const TYPING_DELAY_MS = 3500;

export default function Darkroom({ isTransitioning, onYes, onNo, playTick }) {
  const { index, isComplete, ready, start } = useTypewriter(TYPEWRITER_PROMPT, {
    onTick: playTick,
  });

  useEffect(() => {
    const timer = setTimeout(start, TYPING_DELAY_MS);
    return () => clearTimeout(timer);
    // start is stable for the component's lifetime; run this once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="darkroom-container">
      <div className="typewriter-text">
        {TYPEWRITER_PROMPT.slice(0, index)}
        {!isComplete && <span className="cursor">|</span>}
      </div>

      {ready && (
        <div className="darkroom-buttons">
          <button className="darkroom-button" onClick={onYes} disabled={isTransitioning}>
            yes
          </button>
          <button className="darkroom-button" onClick={onNo} disabled={isTransitioning}>
            no
          </button>
        </div>
      )}
    </div>
  );
}
