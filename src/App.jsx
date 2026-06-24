import { useCallback, useEffect, useRef, useState } from 'react';

import { PHASES, isTrialPhase } from './config/phases';
import { VIDEOS, IMAGES, AUDIO } from './config/assets';

import { useVideoStage } from './hooks/useVideoStage';
import { useZoomLerp } from './hooks/useZoomLerp';
import { useAudio } from './hooks/useAudio';

import { fireConfetti } from './lib/confetti';
import { preloadImages } from './lib/preload';

import Stage from './components/Stage';
import PrestartScreen from './components/PrestartScreen';
import StartScreen from './components/StartScreen';
import PaperPrompt from './components/PaperPrompt';
import Darkroom from './components/Darkroom';
import Explosion from './components/Explosion';
import Finale from './components/Finale';

import './styles/experience.css';

// How much the stage dollies in for each kind of moment.
const ZOOM = { intimate: 145, pulledBack: 120 };

// The loop clip that plays while waiting for input in each phase.
const LOOP_VIDEO = {
  [PHASES.TRIAL_1_LOOP]: VIDEOS.loop,
  [PHASES.TRIAL_2_LOOP]: VIDEOS.loopTired,
  [PHASES.TRIAL_3_LOOP]: VIDEOS.loopTired2,
  [PHASES.DARKROOM_LOOP]: VIDEOS.no4,
};

export default function App() {
  const [phase, setPhase] = useState(PHASES.PRESTART);
  const [startClicked, setStartClicked] = useState(false);
  const [startHovered, setStartHovered] = useState(false);
  const [paperStage, setPaperStage] = useState(1);
  const [hover, setHover] = useState('none');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPaperClickVideo, setShowPaperClickVideo] = useState(false);

  const {
    videoRefA,
    videoRefB,
    videoAudioRef,
    isActiveVideo,
    playVideo,
    resolveSrc,
    stopVideoAudio,
    resetStage,
  } = useVideoStage();
  const { setZoomTarget, resetZoom } = useZoomLerp(videoRefA, videoRefB);
  const {
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
  } = useAudio();

  // What to do when the current clip finishes; set by whatever triggered it.
  const pendingEndAction = useRef(null);

  // Preload the hand-drawn frames (clips + their audio are warmed in the stage).
  useEffect(() => {
    preloadImages(Object.values(IMAGES));
  }, []);

  // --- prestart -> start ---------------------------------------------------
  const handlePrestart = useCallback(() => {
    setPhase(PHASES.START);
    playMusic(AUDIO.startSong);
  }, [playMusic]);

  const nudgeMusic = useCallback(() => {
    if (bgMusicRef.current?.paused) {
      bgMusicRef.current.play().catch(() => {});
    }
  }, [bgMusicRef]);

  // --- start -> opening ----------------------------------------------------
  const handleStart = useCallback(() => {
    if (startClicked) return;
    setStartClicked(true);

    // Let the button's zoom finish, fade the title card, then drop into the film.
    setTimeout(() => {
      document.querySelector('.start-screen')?.classList.add('start-screen-fading');
      setTimeout(() => {
        stopMusic();
        setPhase(PHASES.OPENING);
        setStartClicked(false);
        playVideo(VIDEOS.default, false);
      }, 300);
    }, 700);
  }, [startClicked, stopMusic, playVideo]);

  const handleSkipOpening = useCallback(() => {
    if (phase !== PHASES.OPENING) return;
    stopVideoAudio();
    pendingEndAction.current = null;
    setPhase(PHASES.TRIAL_1_LOOP);
    playVideo(VIDEOS.loop, true);
    playMusic(AUDIO.song1);
    setZoomTarget(ZOOM.intimate);
  }, [phase, stopVideoAudio, playVideo, playMusic, setZoomTarget]);

  // --- trial / darkroom: yes ----------------------------------------------
  const handleYes = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    stopMusic();
    stopVideoAudio();
    setHover('none');
    fireConfetti();

    if (phase === PHASES.DARKROOM_LOOP) {
      setPhase(PHASES.YES_SEQUENCE);
      setZoomTarget(ZOOM.intimate);
      playVideo(VIDEOS.yes, false);
      pendingEndAction.current = 'yes_finished';
    } else if (isTrialPhase(phase)) {
      // Play the check-the-box animation where the note sits, then continue.
      setZoomTarget(ZOOM.intimate);
      setShowPaperClickVideo(true);
    }
  }, [isTransitioning, phase, stopMusic, stopVideoAudio, playVideo, setZoomTarget]);

  const handlePaperClickEnded = useCallback(() => {
    setShowPaperClickVideo(false);
    setPhase(PHASES.YES_SEQUENCE);
    playVideo(VIDEOS.yes, false);
    pendingEndAction.current = 'yes_finished';
  }, [playVideo]);

  // --- trial / darkroom: no ------------------------------------------------
  const handleNo = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    stopMusic();
    stopVideoAudio();
    setHover('none');

    if (phase === PHASES.DARKROOM_LOOP) {
      setPhase(PHASES.EXPLOSION); // the Explosion screen handles its own clip + timers
    } else if (phase === PHASES.TRIAL_1_LOOP) {
      setZoomTarget(ZOOM.pulledBack);
      playVideo(VIDEOS.no1, false);
      pendingEndAction.current = 'no_trial_1_done';
    } else if (phase === PHASES.TRIAL_2_LOOP) {
      setZoomTarget(ZOOM.pulledBack);
      playVideo(VIDEOS.no2, false);
      pendingEndAction.current = 'no_trial_2_done';
    } else if (phase === PHASES.TRIAL_3_LOOP) {
      setZoomTarget(ZOOM.pulledBack);
      playVideo(VIDEOS.no3, false);
      pendingEndAction.current = 'no_trial_3_done';
    }
  }, [isTransitioning, phase, stopMusic, stopVideoAudio, playVideo, setZoomTarget]);

  // --- hover reactions during trials ---------------------------------------
  const handleHoverEnter = useCallback((type) => {
    if (isTransitioning || !isTrialPhase(phase)) return;
    setHover(type);

    if (type === 'yes') {
      playVideo(VIDEOS.yesHover, true);
    } else if (type === 'no') {
      const clip = phase === PHASES.TRIAL_3_LOOP ? VIDEOS.noHover2 : VIDEOS.noHover1;
      playVideo(clip, true);
    }
  }, [isTransitioning, phase, playVideo]);

  const handleHoverLeave = useCallback(() => {
    if (isTransitioning || !isTrialPhase(phase)) return;
    setHover('none');
    playVideo(LOOP_VIDEO[phase] || VIDEOS.loop, true);
  }, [isTransitioning, phase, playVideo]);

  // --- the clip-finished state machine -------------------------------------
  const handleVideoEnded = useCallback((e) => {
    // Only react to the slot that's actually on screen.
    if (!isActiveVideo(e.target)) return;

    const action = pendingEndAction.current;
    pendingEndAction.current = null;

    if (phase === PHASES.OPENING && !action) {
      setPhase(PHASES.TRIAL_1_LOOP);
      playVideo(VIDEOS.loop, true);
      playMusic(AUDIO.song1);
      setZoomTarget(ZOOM.intimate);
      return;
    }

    switch (action) {
      case 'yes_finished':
        setPhase(PHASES.FINISHED); // Finale handles its own intro + soundtrack
        setIsTransitioning(false);
        return;
      case 'no_trial_1_done':
        setPhase(PHASES.TRIAL_2_LOOP);
        setPaperStage(2);
        setIsTransitioning(false);
        playVideo(VIDEOS.loopTired, true);
        playMusic(AUDIO.song2);
        setZoomTarget(ZOOM.intimate);
        return;
      case 'no_trial_2_done':
        setPhase(PHASES.TRIAL_3_LOOP);
        setPaperStage(3);
        setIsTransitioning(false);
        playVideo(VIDEOS.loopTired2, true);
        playMusic(AUDIO.song3);
        setZoomTarget(ZOOM.intimate);
        return;
      case 'no_trial_3_done':
        setPhase(PHASES.DARKROOM_LOOP); // Darkroom handles the typing delay
        setPaperStage(0);
        setIsTransitioning(false);
        playVideo(VIDEOS.no4, true);
        setZoomTarget(ZOOM.intimate);
        return;
      default:
        return;
    }
  }, [phase, isActiveVideo, playVideo, playMusic, setZoomTarget]);

  // --- start over from the explosion ending --------------------------------
  const resetAll = useCallback(() => {
    resetAudio();
    stopVideoAudio();
    resetStage();
    resetZoom();
    pendingEndAction.current = null;

    setPhase(PHASES.PRESTART);
    setPaperStage(1);
    setHover('none');
    setIsTransitioning(false);
    setShowPaperClickVideo(false);
    setStartHovered(false);
    setStartClicked(false);
  }, [resetAudio, stopVideoAudio, resetStage, resetZoom]);

  const cover = phase === PHASES.YES_SEQUENCE || phase === PHASES.FINISHED;

  return (
    <div className={`valentine-container${isTransitioning ? ' transitioning' : ''}`}>
      <Stage
        videoRefA={videoRefA}
        videoRefB={videoRefB}
        cover={cover}
        onEnded={handleVideoEnded}
      />

      <audio ref={bgMusicRef} />
      <audio ref={videoAudioRef} />
      <audio ref={typewriterRef} src={AUDIO.typewriter} />
      <audio ref={romanceRef} />
      <audio ref={nextRef} src={AUDIO.next} preload="auto" />

      {phase === PHASES.OPENING && (
        <button className="skip-button" onClick={handleSkipOpening}>
          skip
        </button>
      )}

      {phase === PHASES.PRESTART && <PrestartScreen onStart={handlePrestart} />}

      {phase === PHASES.START && (
        <StartScreen
          clicked={startClicked}
          hovered={startHovered}
          onHoverChange={setStartHovered}
          onClick={handleStart}
          onNudgeMusic={nudgeMusic}
        />
      )}

      {isTrialPhase(phase) && (
        <PaperPrompt
          stage={paperStage}
          hover={hover}
          isTransitioning={isTransitioning}
          showClickVideo={showPaperClickVideo}
          resolveSrc={resolveSrc}
          onHoverEnter={handleHoverEnter}
          onHoverLeave={handleHoverLeave}
          onYes={handleYes}
          onNo={handleNo}
          onClickVideoEnded={handlePaperClickEnded}
        />
      )}

      {phase === PHASES.DARKROOM_LOOP && (
        <Darkroom
          isTransitioning={isTransitioning}
          onYes={handleYes}
          onNo={handleNo}
          playTick={playTypewriterTick}
        />
      )}

      {phase === PHASES.EXPLOSION && (
        <Explosion resolveSrc={resolveSrc} onRetry={resetAll} />
      )}

      {phase === PHASES.FINISHED && (
        <Finale
          playNext={playNext}
          startRomance={startRomance}
          stopRomance={stopRomance}
        />
      )}
    </div>
  );
}
