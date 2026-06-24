import { useEffect, useRef } from 'react';
import { IMAGES, VIDEOS } from '../config/assets';

// The three "trial" rounds. A hand-drawn note slides up from the bottom with
// invisible yes / no hitboxes positioned over the drawing. Hovering swaps the
// note art (and triggers a reaction clip on the stage); saying yes plays a
// little check-the-box animation in the note's place.
const PAPER_ART = {
  1: { base: IMAGES.paper1, yes: IMAGES.paper1Yes, no: IMAGES.paper1No },
  2: { base: IMAGES.paper2, yes: IMAGES.paper2Yes, no: IMAGES.paper2No },
  3: { base: IMAGES.paper3, yes: IMAGES.paper3Yes, no: IMAGES.paper3No },
};

function paperImage(stage, hover) {
  const art = PAPER_ART[stage] || PAPER_ART[1];
  if (hover === 'yes') return art.yes;
  if (hover === 'no') return art.no;
  return art.base;
}

export default function PaperPrompt({
  stage,
  hover,
  isTransitioning,
  showClickVideo,
  resolveSrc,
  onHoverEnter,
  onHoverLeave,
  onYes,
  onNo,
  onClickVideoEnded,
}) {
  const clickVideoRef = useRef(null);

  // Play the check-the-box clip once it has mounted into the DOM.
  useEffect(() => {
    if (showClickVideo && clickVideoRef.current) {
      clickVideoRef.current.src = resolveSrc(VIDEOS.paperYesClick);
      clickVideoRef.current.load();
      clickVideoRef.current.play().catch(() => {});
    }
  }, [showClickVideo, resolveSrc]);

  const isExiting = isTransitioning && !showClickVideo;
  const containerClass =
    `paper-container${isExiting ? ' paper-exit' : ''}${stage === 3 ? ' paper-no-anim' : ''}`;

  return (
    <>
      <div className={containerClass}>
        <img src={paperImage(stage, hover)} alt="" className="paper-image" />
        <div
          className={`hitbox hitbox-yes-${stage}`}
          onMouseEnter={() => onHoverEnter('yes')}
          onMouseLeave={onHoverLeave}
          onClick={onYes}
        />
        <div
          className={`hitbox hitbox-no-${stage}`}
          onMouseEnter={() => onHoverEnter('no')}
          onMouseLeave={onHoverLeave}
          onClick={onNo}
        />
      </div>

      {showClickVideo && (
        <div className="paper-click-video-container">
          <video
            ref={clickVideoRef}
            className="paper-click-video"
            muted
            playsInline
            onEnded={onClickVideoEnded}
          />
        </div>
      )}
    </>
  );
}
