import { useEffect, useState } from 'react';
import { LOVE_LETTER, FINALE_HEADING } from '../config/script';

// The payoff. A loading fake-out ("..." then "hey...") sets the tone, romance
// music kicks in, and the love letter is revealed one sliding panel at a time.
const LOADING_MS = 3000;
const HEY_MS = 3000;
const PANEL_SLIDE_MS = 600;
const DOTS_INTERVAL_MS = 500;

const cycleDots = (prev) => (prev.length >= 3 ? '.' : prev + '.');

export default function Finale({ playNext, startRomance, stopRomance }) {
  const [stage, setStage] = useState('loading'); // 'loading' -> 'hey' -> 'letter'
  const [dots, setDots] = useState('.');
  const [panel, setPanel] = useState(0);
  const [slide, setSlide] = useState('center'); // 'center' | 'exiting' | 'entering'

  // Soundtrack: start on mount, stop when we leave the finale (e.g. on retry).
  useEffect(() => {
    startRomance();
    return stopRomance;
  }, [startRomance, stopRomance]);

  // The two-step loading fake-out before the letter appears.
  useEffect(() => {
    const toHey = setTimeout(() => setStage('hey'), LOADING_MS);
    const toLetter = setTimeout(() => setStage('letter'), LOADING_MS + HEY_MS);
    return () => {
      clearTimeout(toHey);
      clearTimeout(toLetter);
    };
  }, []);

  // Animate the "..." while loading.
  useEffect(() => {
    if (stage === 'letter') return;
    const interval = setInterval(() => setDots(cycleDots), DOTS_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [stage]);

  const goNext = () => {
    if (panel >= LOVE_LETTER.length - 1) return;
    playNext();
    setSlide('exiting');
    setTimeout(() => {
      setPanel((prev) => prev + 1);
      setSlide('entering');
      requestAnimationFrame(() => requestAnimationFrame(() => setSlide('center')));
    }, PANEL_SLIDE_MS);
  };

  if (stage !== 'letter') {
    return (
      <div className="finished-container">
        <div className="finished-loading-dots">
          {stage === 'hey' ? `hey${dots}` : dots}
        </div>
      </div>
    );
  }

  const slideClass =
    slide === 'exiting' ? 'panel-left' : slide === 'entering' ? 'panel-right' : 'panel-center';
  const isLastPanel = panel >= LOVE_LETTER.length - 1;

  return (
    <div className="finished-container">
      <div className="finished-text">{FINALE_HEADING}</div>
      <div className="finished-panel-wrapper">
        <div className={`finished-panel ${slideClass}`}>
          <div className="finished-subtext">{LOVE_LETTER[panel]}</div>
          {!isLastPanel && (
            <button className="finished-next-btn" onClick={goNext}>
              next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
