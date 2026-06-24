import { useEffect, useRef, useState } from 'react';
import { VIDEOS } from '../config/assets';
import { EXPLOSION_MESSAGE } from '../config/script';

// The hidden ending: turn the question down one final time and things do not
// end well. Plays the explosion clip, lands the message, then offers a retry.
const TEXT_DELAY_MS = 2000;
const RETRY_DELAY_MS = 5000;

export default function Explosion({ resolveSrc, onRetry }) {
  const videoRef = useRef(null);
  const [showText, setShowText] = useState(false);
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = resolveSrc(VIDEOS.explosion);
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }

    const textTimer = setTimeout(() => setShowText(true), TEXT_DELAY_MS);
    const retryTimer = setTimeout(() => setShowRetry(true), RETRY_DELAY_MS);
    return () => {
      clearTimeout(textTimer);
      clearTimeout(retryTimer);
    };
  }, [resolveSrc]);

  return (
    <div className="explosion-container">
      <video ref={videoRef} className="explosion-video" muted playsInline />

      {showText && <div className="explosion-text">{EXPLOSION_MESSAGE}</div>}

      {showRetry && (
        <button className="retry-button" onClick={onRetry}>
          RETRY
        </button>
      )}
    </div>
  );
}
