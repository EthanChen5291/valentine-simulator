import { IMAGES } from '../config/assets';

// The title card: a hand-drawn room with a floating start button that zooms in
// on click. Pointer moves also retry starting the music in case the browser
// hadn't unlocked audio yet.
export default function StartScreen({ clicked, hovered, onHoverChange, onClick, onNudgeMusic }) {
  return (
    <div
      className="start-screen"
      onMouseMove={onNudgeMusic}
      onClick={onNudgeMusic}
      onMouseDown={onNudgeMusic}
    >
      <img src={IMAGES.startBg} alt="" className="start-screen-bg" />
      <div
        className={`start-button-wrapper${clicked ? ' start-clicked' : ''}${hovered ? ' start-hovered' : ''}`}
      >
        <img src={IMAGES.startButton} alt="Start" className="start-button-img" />
        <div
          className="start-button-hitbox"
          onClick={onClick}
          onMouseEnter={() => onHoverChange(true)}
          onMouseLeave={() => onHoverChange(false)}
        />
      </div>
    </div>
  );
}
