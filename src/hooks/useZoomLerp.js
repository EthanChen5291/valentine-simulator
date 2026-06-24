import { useCallback, useEffect, useRef } from 'react';

const INITIAL_SCALE = 105;
const INITIAL_TARGET = 120;
const LERP_SPEED = 0.06;

// Smoothly eases the stage's zoom toward a target percentage every frame. The
// videos are sized in percent, so nudging the target gives a gentle dolly that
// makes phase changes feel cinematic rather than abrupt.
export function useZoomLerp(videoRefA, videoRefB) {
  const scale = useRef(INITIAL_SCALE);
  const target = useRef(INITIAL_TARGET);
  const frame = useRef(null);

  const setZoomTarget = useCallback((next) => {
    target.current = next;
  }, []);

  const resetZoom = useCallback(() => {
    scale.current = INITIAL_SCALE;
    target.current = INITIAL_TARGET;
  }, []);

  useEffect(() => {
    const tick = () => {
      scale.current += (target.current - scale.current) * LERP_SPEED;
      if (Math.abs(target.current - scale.current) < 0.1) {
        scale.current = target.current;
      }

      const size = `${scale.current}%`;
      if (videoRefA.current) {
        videoRefA.current.style.width = size;
        videoRefA.current.style.height = size;
      }
      if (videoRefB.current) {
        videoRefB.current.style.width = size;
        videoRefB.current.style.height = size;
      }

      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [videoRefA, videoRefB]);

  return { setZoomTarget, resetZoom };
}
