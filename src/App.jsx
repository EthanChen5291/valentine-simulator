import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';

// Video paths
const VIDEOS = {
  default: '/assets/art/valentine_default.mp4',
  loop: '/assets/art/valentine_loop.mp4',
  loopTired: '/assets/art/valentine_loop_tired.mp4',
  loopTired2: '/assets/art/valentine_loop_tired_2.mp4',
  yesHover: '/assets/art/valentine_yes_hover.mp4',
  noHover1: '/assets/art/valentine_no_hover_1.mp4',
  noHover2: '/assets/art/valentine_no_hover_2.mp4',
  no1: '/assets/art/valentine_no_1.mp4',
  no2: '/assets/art/valentine_no_2.mp4',
  no3: '/assets/art/valentine_no_3.mp4',
  no4: '/assets/art/valentine_no_4.mp4',
  paperYesClick: '/assets/art/valentine_paper_yes_click.mp4',
  yes: '/assets/art/valentine_yes.mp4',
  explosion: '/assets/art/explosion.mp4',
};

// Image paths
const IMAGES = {
  startBg: '/assets/art/valentine_start_bg.png',
  startButton: '/assets/art/valentine_start_button.png',
  paper1: '/assets/art/valentine_paper_1.png',
  paper1Yes: '/assets/art/valentine_paper_1_yes.png',
  paper1No: '/assets/art/valentine_paper_1_no.png',
  paper2: '/assets/art/valentine_paper_2.png',
  paper2Yes: '/assets/art/valentine_paper_2_yes.png',
  paper2No: '/assets/art/valentine_paper_2_no.png',
  paper3: '/assets/art/valentine_paper_3.png',
  paper3Yes: '/assets/art/valentine_paper_3_yes.png',
  paper3No: '/assets/art/valentine_paper_3_no.png',
};

// Audio paths
const AUDIO = {
  startSong: '/assets/songs/VALENTINE_start_song.mp3',
  song1: '/assets/songs/song1.mp3',
  song2: '/assets/songs/song2.mp3',
  song3: '/assets/songs/song3.mp3',
  typewriter: '/assets/songs/typewriter.mp3',
  romance: '/assets/songs/romance.mp3',
  next: '/assets/songs/next.mp3',
};

// Video-to-audio mapping (audio extracted from videos)
const VIDEO_AUDIO = {
  [VIDEOS.default]: '/assets/songs/VALENTINE_default.mp3',
  [VIDEOS.no1]: '/assets/songs/VALENTINE_no_1.mp3',
  [VIDEOS.no2]: '/assets/songs/VALENTINE_no_2.mp3',
  [VIDEOS.no3]: '/assets/songs/VALENTINE_no_3.mp3',
  [VIDEOS.no4]: '/assets/songs/VALENTINE_no_4.mp3',
  [VIDEOS.noHover1]: '/assets/songs/VALENTINE_no_hover_1.mp3',
  [VIDEOS.noHover2]: '/assets/songs/VALENTINE_no_hover_2.mp3',
  [VIDEOS.yesHover]: '/assets/songs/VALENTINE_yes_hover.mp3',
  [VIDEOS.yes]: '/assets/songs/VALENTINE_YES.mp3',
};

// Phase constants
const PHASES = {
  PRESTART: 'prestart',
  START: 'start',
  OPENING: 'opening',
  TRIAL_1_LOOP: 'trial_1_loop',
  TRIAL_2_LOOP: 'trial_2_loop',
  TRIAL_3_LOOP: 'trial_3_loop',
  DARKROOM_LOOP: 'darkroom_loop',
  YES_SEQUENCE: 'yes_sequence',
  FINISHED: 'finished',
  EXPLOSION: 'explosion',
};

const TYPEWRITER_TEXT = 'do you want to be my valentine';

const FINISHED_PANELS = [
  "I love you sweetie. Sorry for all the complications - I just wanted to make sure this was a true surprise! You were onto me and Rachel so I delayed it by a day to TRUELY catch you off guard - and I hope I did LOL",
  "This year has been amazing, and I'm glad and grateful that I've been able to spend it with someone as splendid as you. You deserve the best, and you have a large place in my heart. Amidst all the jokes, rage-bait, competition, judgement, and fights, I want you to know that I love you. Know this, and recall this because all that I mentioned earlier will 100% continue! And I look forward to it :)",
  "I'm grateful for your constant willingness to grow for me. I'm grateful for your effort and patient in tolerating my jabs and (occasional) immaturity. You are the strongest girl I know, and I know we both will do great things in life, with family and with career.",
  "I love you. I wish I was there in your room so I can hug you. Moreover, I wish that, just maybe, I could've given you some flowers -> why didn't you tell me your mail number? :( If only we had some flowers ...",
  "I think I hear a friend. Why don't you check what your fellow white bear has to say to you?",
];

// CSS styles as a string for injection
const CSS_STYLES = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    overflow: hidden;
    background: #000;
  }

  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-12px); }
  }

  @keyframes zoomInStart {
    0% { transform: scale(1); }
    100% { transform: scale(12); }
  }

  .prestart-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 300;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .prestart-text {
    font-family: "Courier New", Courier, monospace;
    font-size: 1.5rem;
    color: #fff;
    letter-spacing: 0.1em;
  }

  .start-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 200;
    overflow: hidden;
  }

  .start-screen-bg {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .start-button-wrapper {
    position: absolute;
    top: calc(50% - 400px + 50px);
    left: calc(50% - 400px - 50px);
    transform: translate(-50%, -50%);
    cursor: default;
    animation: float 3s ease-in-out infinite;
    transition: scale 0.3s ease-in;
    pointer-events: none;
  }

  .start-button-wrapper.start-hovered {
    scale: 1.1;
  }

  .start-button-wrapper.start-clicked {
    animation: zoomInStart 0.45s cubic-bezier(0.2, 0, 1, 0.3) forwards;
  }

  .start-screen.start-screen-fading {
    transition: opacity 0.3s ease;
    opacity: 0;
  }

  .start-button-img {
    width: min(900px, 80vw);
    height: auto;
    display: block;
    pointer-events: none;
  }

  .start-button-hitbox {
    position: absolute;
    left: 25%;
    top: 33.33%;
    width: 50%;
    height: 33.33%;
    cursor: pointer;
    pointer-events: auto;
  }

  .valentine-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: #000;
  }

  .background-video {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    object-fit: contain;
  }

  .background-video.video-cover {
    object-fit: cover;
    width: 100% !important;
    height: 100% !important;
  }

  @keyframes paperSlideUp {
    from { transform: translateX(-50%) translateY(100%); }
    to { transform: translateX(-50%) translateY(0); }
  }

  @keyframes paperSlideDown {
    from { transform: translateX(-50%) translateY(0); }
    to { transform: translateX(-50%) translateY(100%); }
  }

  .paper-container {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 75%;
    max-width: 950px;
    z-index: 5;
    animation: paperSlideUp 0.35s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
  }

  .paper-container.paper-no-anim {
    animation: none;
    transform: translateX(-50%) translateY(0);
  }

  .paper-container.paper-exit {
    animation: paperSlideDown 0.25s cubic-bezier(0.55, 0, 1, 0.45) forwards;
  }

  .paper-image {
    width: 100%;
    height: auto;
    display: block;
    pointer-events: none;
  }

  .hitbox {
    position: absolute;
    cursor: pointer;
    background: transparent;
    border: none;
  }

  .valentine-container.transitioning {
    cursor: not-allowed;
  }

  .valentine-container.transitioning .hitbox,
  .valentine-container.transitioning .darkroom-button {
    pointer-events: none;
    cursor: not-allowed;
  }

  .hitbox-yes-1 {
    left: 4.17%;
    top: 80%;
    width: 20.83%;
    height: 20%;
  }

  .hitbox-yes-2 {
    left: 4.17%;
    top: 80%;
    width: 20.83%;
    height: 20%;
  }

  .hitbox-yes-3 {
    left: 4.17%;
    top: 83.3%;
    width: 20.83%;
    height: 16.7%;
  }

  .hitbox-no-1 {
    left: 28%;
    bottom: 0;
    width: 20%;
    height: 17.5%;
  }

  .hitbox-no-2 {
    left: 47%;
    top: 88%;
    width: 7.5%;
    height: 10%;
  }

  .hitbox-no-3 {
    right: 2%;
    top: 2%;
    width: 10%;
    height: 10.5%;
  }

  .paper-click-video-container {
    position: absolute;
    bottom: -40px;
    left: 318px;
    width: 234.6px;
    height: 234.6px;
    z-index: 10;
  }

  .paper-click-video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  .darkroom-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 10;
  }

  .typewriter-text {
    font-family: "Courier New", Courier, monospace;
    font-size: 2.5rem;
    color: #fff;
    letter-spacing: 0.1em;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }

  .cursor {
    animation: blink 1s infinite;
  }

  .darkroom-buttons {
    margin-top: 3rem;
    display: flex;
    gap: 3rem;
    justify-content: center;
    animation: fadeIn 0.5s ease;
  }

  .darkroom-button {
    font-family: "Courier New", Courier, monospace;
    font-size: 1.5rem;
    color: #fff;
    background-color: transparent;
    border: 2px solid #fff;
    padding: 1rem 2rem;
    cursor: pointer;
    letter-spacing: 0.2em;
    transition: all 0.2s ease;
    text-transform: lowercase;
  }

  .darkroom-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }

  .darkroom-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .explosion-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #000;
    z-index: 100;
  }

  .explosion-video {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 80%;
    max-height: 80%;
  }

  .explosion-text {
    font-family: "Courier New", Courier, monospace;
    font-size: 1.8rem;
    color: #ff0000;
    text-align: center;
    z-index: 101;
    text-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
    animation: fadeIn 1s ease;
  }

  .retry-button {
    position: absolute;
    bottom: 20%;
    font-family: "Courier New", Courier, monospace;
    font-size: 1.2rem;
    color: #fff;
    background-color: #333;
    border: 2px solid #fff;
    padding: 1rem 3rem;
    cursor: pointer;
    letter-spacing: 0.3em;
    z-index: 101;
    transition: all 0.2s ease;
    animation: fadeIn 0.5s ease;
  }

  .retry-button:hover {
    background-color: #555;
    transform: scale(1.05);
  }

  .finished-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 50;
    width: 80%;
    max-width: 700px;
    overflow: visible;
  }

  .finished-loading-dots {
    font-family: Georgia, serif;
    font-size: 3rem;
    color: #fff;
    letter-spacing: 0.3em;
    animation: fadeIn 0.5s ease;
  }

  .finished-text {
    font-family: Georgia, serif;
    font-size: 3rem;
    color: #ff69b4;
    text-shadow: 0 0 30px rgba(255, 105, 180, 0.8);
    margin-bottom: 1.5rem;
    animation: pulse 2s infinite;
  }

  .finished-panel-wrapper {
    position: relative;
    min-height: 350px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
  }

  .finished-panel {
    position: absolute;
    width: 100%;
    transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.6s ease;
  }

  .finished-panel.panel-center {
    transform: translateX(0);
    opacity: 1;
  }

  .finished-panel.panel-left {
    transform: translateX(-120%);
    opacity: 0;
  }

  .finished-panel.panel-right {
    transform: translateX(120%);
    opacity: 0;
  }

  .finished-subtext {
    font-family: Georgia, serif;
    font-size: 1.5rem;
    color: #fff;
    opacity: 0.9;
    line-height: 1.8;
    margin-top: 1.5rem;
  }

  .finished-next-btn {
    display: inline-block;
    margin-top: 2rem;
    font-family: Georgia, serif;
    font-size: 1.1rem;
    color: #ff69b4;
    background: transparent;
    border: 2px solid #ff69b4;
    padding: 0.7rem 2.5rem;
    cursor: pointer;
    letter-spacing: 0.15em;
    transition: all 0.25s ease;
    border-radius: 4px;
  }

  .finished-next-btn:hover {
    background: rgba(255, 105, 180, 0.15);
    transform: scale(1.05);
  }

  .skip-button {
    position: fixed;
    bottom: 12px;
    right: 16px;
    font-family: "Courier New", Courier, monospace;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.35);
    background: transparent;
    border: none;
    cursor: pointer;
    z-index: 300;
    letter-spacing: 0.1em;
    padding: 4px 8px;
    transition: color 0.2s ease;
  }

  .skip-button:hover {
    color: rgba(255, 255, 255, 0.6);
  }

  @media (max-width: 768px) {
    .typewriter-text {
      font-size: 1.5rem;
    }

    .darkroom-button {
      font-size: 1.2rem;
      padding: 0.8rem 1.5rem;
    }

    .finished-text {
      font-size: 2rem;
    }

    .finished-subtext {
      font-size: 1rem;
    }

    .finished-container {
      width: 90%;
    }

    .explosion-text {
      font-size: 1.2rem;
      padding: 0 1rem;
    }

    .paper-container {
      width: 95%;
    }
  }
`;

function App() {
  // Core state
  const [phase, setPhase] = useState(PHASES.PRESTART);
  const [startClicked, setStartClicked] = useState(false);
  const [startHovered, setStartHovered] = useState(false);
  const [paperStage, setPaperStage] = useState(1);
  const [hoverState, setHoverState] = useState('none');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);
  const [showDarkroomButtons, setShowDarkroomButtons] = useState(false);
  const [showExplosionText, setShowExplosionText] = useState(false);
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [finishedPanel, setFinishedPanel] = useState(0);
  const [panelDirection, setPanelDirection] = useState('center'); // 'center', 'exiting', 'entering'
  const [finishedLoading, setFinishedLoading] = useState(true);
  const [loadingDots, setLoadingDots] = useState('.');
  const [heyLoading, setHeyLoading] = useState(false);
  const [heyLoadingDots, setHeyLoadingDots] = useState('.');

  // Refs
  const videoRefA = useRef(null);
  const videoRefB = useRef(null);
  const activeVideoSlot = useRef('A'); // which slot is currently visible
  const explosionVideoRef = useRef(null);
  const paperClickVideoRef = useRef(null);
  const [showPaperClickVideo, setShowPaperClickVideo] = useState(false);
  const bgMusicRef = useRef(null);
  const videoAudioRef = useRef(null);
  const typewriterSoundRef = useRef(null);
  const romanceAudioRef = useRef(null);
  const nextSoundRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const pendingVideoEndAction = useRef(null);

  // Preloaded blob URL cache
  const blobUrlCache = useRef({});

  // Generation counter to cancel stale playVideo callbacks
  const playVideoGen = useRef(0);

  // Zoom lerp refs
  const zoomScaleRef = useRef(105); // current zoom percentage
  const zoomTargetRef = useRef(120); // target zoom percentage
  const zoomAnimFrameRef = useRef(null);

  // Inject CSS on mount
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = CSS_STYLES;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Helper: Stop video audio
  const stopVideoAudio = useCallback(() => {
    if (videoAudioRef.current) {
      videoAudioRef.current.pause();
      videoAudioRef.current.currentTime = 0;
    }
  }, []);

  // Resolve a video src to its preloaded blob URL (or fall back to original)
  const resolveVideoSrc = useCallback((src) => {
    return blobUrlCache.current[src] || src;
  }, []);

  // Get the currently active and inactive video elements
  const getVideoRefs = useCallback(() => {
    if (activeVideoSlot.current === 'A') {
      return { active: videoRefA.current, inactive: videoRefB.current, nextSlot: 'B' };
    }
    return { active: videoRefB.current, inactive: videoRefA.current, nextSlot: 'A' };
  }, []);

  // Helper: Play video with optional loop, syncing matched audio
  // Uses dual-video overlay: loads new video on the hidden element, then swaps once ready
  const playVideo = useCallback((src, loop = false) => {
    stopVideoAudio();
    const audioSrc = VIDEO_AUDIO[src];
    const resolvedSrc = resolveVideoSrc(src);

    // Increment generation so any pending callbacks from previous calls are ignored
    const gen = ++playVideoGen.current;

    const { active, inactive, nextSlot } = getVideoRefs();
    if (!inactive) return;

    // Prepare the inactive (hidden) video element
    inactive.src = resolvedSrc;
    inactive.loop = loop;
    inactive.load();

    const swapAndPlay = () => {
      // Stale call — a newer playVideo has been issued, bail out
      if (gen !== playVideoGen.current) return;

      // Bring the new video to the front and hide the old one
      inactive.style.zIndex = '2';
      active.style.zIndex = '1';
      activeVideoSlot.current = nextSlot;

      // Stop the old video after a brief moment to avoid flicker
      setTimeout(() => {
        active.pause();
      }, 100);
    };

    // If there's matching audio, wait for both to be ready before playing
    if (audioSrc && videoAudioRef.current) {
      const video = inactive;
      const audio = videoAudioRef.current;

      audio.src = audioSrc;
      audio.loop = loop;
      audio.volume = audioSrc.includes('VALENTINE_no_hover_1') ? 0.6 : 1.0;
      audio.load();

      let videoReady = false;
      let audioReady = false;

      const tryPlayBoth = () => {
        if (gen !== playVideoGen.current) return;
        if (videoReady && audioReady) {
          video.currentTime = 0;
          audio.currentTime = 0;
          video.play().catch(() => {});
          audio.play().catch(() => {});
          swapAndPlay();
        }
      };

      const onVideoReady = () => {
        videoReady = true;
        video.removeEventListener('canplaythrough', onVideoReady);
        tryPlayBoth();
      };

      const onAudioReady = () => {
        audioReady = true;
        audio.removeEventListener('canplaythrough', onAudioReady);
        tryPlayBoth();
      };

      // Always register listeners first, then check readyState as fallback.
      // After load(), readyState resets — but blob URLs may resolve instantly.
      video.addEventListener('canplaythrough', onVideoReady, { once: true });
      audio.addEventListener('canplaythrough', onAudioReady, { once: true });

      if (video.readyState >= 4) {
        videoReady = true;
        video.removeEventListener('canplaythrough', onVideoReady);
      }

      if (audio.readyState >= 4) {
        audioReady = true;
        audio.removeEventListener('canplaythrough', onAudioReady);
      }

      tryPlayBoth();
    } else {
      // No matching audio — wait for video to be ready, then swap
      const onReady = () => {
        if (gen !== playVideoGen.current) return;
        inactive.removeEventListener('canplaythrough', onReady);
        inactive.currentTime = 0;
        inactive.play().catch(() => {});
        swapAndPlay();
      };

      // Register listener first, then check readyState as fallback
      inactive.addEventListener('canplaythrough', onReady, { once: true });

      if (inactive.readyState >= 4) {
        inactive.removeEventListener('canplaythrough', onReady);
        inactive.currentTime = 0;
        inactive.play().catch(() => {});
        swapAndPlay();
      }
    }
  }, [stopVideoAudio, resolveVideoSrc, getVideoRefs]);

  // Helper: Play background music
  const playMusic = useCallback((src, volume = 0.3) => {
    if (bgMusicRef.current) {
      bgMusicRef.current.src = src;
      bgMusicRef.current.volume = volume;
      bgMusicRef.current.loop = true;
      bgMusicRef.current.load();
      bgMusicRef.current.play().catch(() => {});
    }
  }, []);

  // Helper: Stop background music
  const stopMusic = useCallback(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
      bgMusicRef.current.currentTime = 0;
    }
  }, []);

  // Helper: Play typewriter sound
  const playTypewriterTick = useCallback(() => {
    if (typewriterSoundRef.current) {
      typewriterSoundRef.current.currentTime = 2;
      typewriterSoundRef.current.volume = 0.5;
      typewriterSoundRef.current.play().catch(() => {});
    }
  }, []);

  // Helper: Get current loop video based on phase
  const getLoopVideo = useCallback((currentPhase) => {
    switch (currentPhase) {
      case PHASES.TRIAL_1_LOOP:
        return VIDEOS.loop;
      case PHASES.TRIAL_2_LOOP:
        return VIDEOS.loopTired;
      case PHASES.TRIAL_3_LOOP:
        return VIDEOS.loopTired2;
      case PHASES.DARKROOM_LOOP:
        return VIDEOS.no4;
      default:
        return VIDEOS.loop;
    }
  }, []);

  // Helper: Get paper image based on stage and hover
  const getPaperImage = useCallback(() => {
    if (paperStage === 1) {
      if (hoverState === 'yes') return IMAGES.paper1Yes;
      if (hoverState === 'no') return IMAGES.paper1No;
      return IMAGES.paper1;
    } else if (paperStage === 2) {
      if (hoverState === 'yes') return IMAGES.paper2Yes;
      if (hoverState === 'no') return IMAGES.paper2No;
      return IMAGES.paper2;
    } else if (paperStage === 3) {
      if (hoverState === 'yes') return IMAGES.paper3Yes;
      if (hoverState === 'no') return IMAGES.paper3No;
      return IMAGES.paper3;
    }
    return IMAGES.paper1;
  }, [paperStage, hoverState]);

  // Check if in trial phase
  const isTrialPhase = useCallback(() => {
    return [PHASES.TRIAL_1_LOOP, PHASES.TRIAL_2_LOOP, PHASES.TRIAL_3_LOOP].includes(phase);
  }, [phase]);

  // Start typewriter effect with organic random delays
  const startTyping = useCallback(() => {
    setTypingIndex(0);
    setIsTypingComplete(false);
    setShowDarkroomButtons(false);

    let index = 0;

    const typeNextChar = () => {
      index++;
      setTypingIndex(index);
      playTypewriterTick();

      if (index >= TYPEWRITER_TEXT.length) {
        setIsTypingComplete(true);
        setTimeout(() => setShowDarkroomButtons(true), 500);
      } else {
        // Random delay between 40-80ms for organic feel
        const delay = 40 + Math.random() * 40;
        typingIntervalRef.current = setTimeout(typeNextChar, delay);
      }
    };

    // Start first character
    const delay = 40 + Math.random() * 40;
    typingIntervalRef.current = setTimeout(typeNextChar, delay);
  }, [playTypewriterTick]);

  // Reset all state
  const resetAll = useCallback(() => {
    clearTimeout(typingIntervalRef.current);
    stopMusic();
    stopVideoAudio();

    setPhase(PHASES.PRESTART);
    setPaperStage(1);
    setHoverState('none');
    setIsTransitioning(false);
    setTypingIndex(0);
    setShowDarkroomButtons(false);
    setShowExplosionText(false);
    setShowRetryButton(false);
    setIsTypingComplete(false);
    setFinishedPanel(0);
    setPanelDirection('center');
    setFinishedLoading(true);
    setLoadingDots('.');
    setHeyLoading(false);
    setHeyLoadingDots('.');
    setShowPaperClickVideo(false);
    setStartHovered(false);
    setStartClicked(false);
    if (romanceAudioRef.current) {
      romanceAudioRef.current.pause();
      romanceAudioRef.current.currentTime = 0;
    }
    pendingVideoEndAction.current = null;
    zoomScaleRef.current = 105;
    zoomTargetRef.current = 120;
    // Reset dual video slots
    if (videoRefA.current) { videoRefA.current.pause(); videoRefA.current.removeAttribute('src'); videoRefA.current.style.zIndex = '2'; }
    if (videoRefB.current) { videoRefB.current.pause(); videoRefB.current.removeAttribute('src'); videoRefB.current.style.zIndex = '1'; }
    activeVideoSlot.current = 'A';
  }, [stopMusic, stopVideoAudio]);

  const startButtonRef = useRef(null);

  // Loading dots animation for finished screen
  useEffect(() => {
    if (!finishedLoading || phase !== PHASES.FINISHED) return;
    const interval = setInterval(() => {
      setLoadingDots((prev) => (prev.length >= 3 ? '.' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, [finishedLoading, phase]);

  // "hey..." loading dots animation for finished screen
  useEffect(() => {
    if (!heyLoading || phase !== PHASES.FINISHED) return;
    const interval = setInterval(() => {
      setHeyLoadingDots((prev) => (prev.length >= 3 ? '.' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, [heyLoading, phase]);

  // Zoom lerp animation loop
  useEffect(() => {
    const lerpSpeed = 0.06;

    const animateZoom = () => {
      const target = zoomTargetRef.current;
      zoomScaleRef.current += (target - zoomScaleRef.current) * lerpSpeed;

      if (Math.abs(target - zoomScaleRef.current) < 0.1) {
        zoomScaleRef.current = target;
      }

      const s = zoomScaleRef.current;
      if (videoRefA.current) {
        videoRefA.current.style.width = `${s}%`;
        videoRefA.current.style.height = `${s}%`;
      }
      if (videoRefB.current) {
        videoRefB.current.style.width = `${s}%`;
        videoRefB.current.style.height = `${s}%`;
      }

      zoomAnimFrameRef.current = requestAnimationFrame(animateZoom);
    };

    zoomAnimFrameRef.current = requestAnimationFrame(animateZoom);
    return () => cancelAnimationFrame(zoomAnimFrameRef.current);
  }, []);

  // Helper: set zoom target
  const setZoomTarget = useCallback((target) => {
    zoomTargetRef.current = target;
  }, []);

  // Handle skip opening animation
  const handleSkipOpening = useCallback(() => {
    if (phase !== PHASES.OPENING) return;
    stopVideoAudio();
    pendingVideoEndAction.current = null;
    setPhase(PHASES.TRIAL_1_LOOP);
    playVideo(VIDEOS.loop, true);
    playMusic(AUDIO.song1);
    setZoomTarget(145);
  }, [phase, stopVideoAudio, playVideo, playMusic, setZoomTarget]);

  // Handle start button click
  const handleStartClick = useCallback(() => {
    if (startClicked) return;
    setStartClicked(true);

    // After zoom animation finishes, fade screen and transition
    setTimeout(() => {
      // Add fade class to start screen
      const screen = document.querySelector('.start-screen');
      if (screen) screen.classList.add('start-screen-fading');

      setTimeout(() => {
        stopMusic();
        setPhase(PHASES.OPENING);
        setStartClicked(false);
        playVideo(VIDEOS.default, false);
      }, 300);
    }, 700);
  }, [startClicked, stopMusic, playVideo]);

  // Fire valentine confetti burst
  const fireConfetti = useCallback(() => {
    const heart = confetti.shapeFromPath({
      path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    });
    const colors = ['#ff69b4', '#ff1493', '#ff85a2', '#ff0066', '#ffffff', '#ffb6c1'];
    const defaults = { spread: 360, ticks: 100, gravity: 0.4, decay: 0.94, startVelocity: 20, colors };

    // Initial big burst
    confetti({ ...defaults, particleCount: 80, scalar: 1.2, shapes: ['circle', 'square'] });
    confetti({ ...defaults, particleCount: 40, scalar: 1.8, shapes: [heart] });

    // Staggered follow-up bursts
    setTimeout(() => {
      confetti({ ...defaults, particleCount: 50, scalar: 1.0, shapes: ['circle'] });
      confetti({ ...defaults, particleCount: 25, scalar: 2.0, shapes: [heart] });
    }, 300);

    setTimeout(() => {
      confetti({ ...defaults, particleCount: 40, scalar: 1.4, shapes: [heart, 'circle'] });
    }, 700);

    // Side cannons
    setTimeout(() => {
      confetti({ ...defaults, particleCount: 30, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, shapes: [heart, 'circle'] });
      confetti({ ...defaults, particleCount: 30, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, shapes: [heart, 'circle'] });
    }, 500);
  }, []);

  // Handle YES click
  const handleYesClick = useCallback(() => {
    if (isTransitioning) return;
    if (phase === PHASES.DARKROOM_LOOP && !showDarkroomButtons) return;

    setIsTransitioning(true);
    stopMusic();
    stopVideoAudio();
    setHoverState('none');
    fireConfetti();

    if (phase === PHASES.DARKROOM_LOOP) {
      // Darkroom YES - go directly to VALENTINE_YES.mp4
      setPhase(PHASES.YES_SEQUENCE);
      setZoomTarget(145);
      playVideo(VIDEOS.yes, false);
      pendingVideoEndAction.current = 'yes_finished';
    } else if (isTrialPhase()) {
      // Trial YES - play paper click animation in the paper position
      setZoomTarget(145);
      setShowPaperClickVideo(true);
    }
  }, [isTransitioning, phase, showDarkroomButtons, stopMusic, stopVideoAudio, playVideo, isTrialPhase, setZoomTarget, fireConfetti]);

  // Handle paper click video ended
  const handlePaperClickEnded = useCallback(() => {
    setShowPaperClickVideo(false);
    setPhase(PHASES.YES_SEQUENCE);
    playVideo(VIDEOS.yes, false);
    pendingVideoEndAction.current = 'yes_finished';
  }, [playVideo]);

  // Play paper click video once it's mounted in the DOM
  useEffect(() => {
    if (showPaperClickVideo && paperClickVideoRef.current) {
      paperClickVideoRef.current.src = resolveVideoSrc(VIDEOS.paperYesClick);
      paperClickVideoRef.current.load();
      paperClickVideoRef.current.play().catch(() => {});
    }
  }, [showPaperClickVideo, resolveVideoSrc]);

  // Handle NO click
  const handleNoClick = useCallback(() => {
    if (isTransitioning) return;
    if (phase === PHASES.DARKROOM_LOOP && !showDarkroomButtons) return;

    setIsTransitioning(true);
    stopMusic();
    stopVideoAudio();
    setHoverState('none');

    if (phase === PHASES.DARKROOM_LOOP) {
      // Darkroom NO - explosion
      setPhase(PHASES.EXPLOSION);

      setTimeout(() => setShowExplosionText(true), 2000);
      setTimeout(() => setShowRetryButton(true), 5000);

      if (explosionVideoRef.current) {
        explosionVideoRef.current.src = resolveVideoSrc(VIDEOS.explosion);
        explosionVideoRef.current.load();
        explosionVideoRef.current.play().catch(() => {});
      }
    } else if (phase === PHASES.TRIAL_1_LOOP) {
      setZoomTarget(120);
      playVideo(VIDEOS.no1, false);
      pendingVideoEndAction.current = 'no_trial_1_done';
    } else if (phase === PHASES.TRIAL_2_LOOP) {
      setZoomTarget(120);
      playVideo(VIDEOS.no2, false);
      pendingVideoEndAction.current = 'no_trial_2_done';
    } else if (phase === PHASES.TRIAL_3_LOOP) {
      setZoomTarget(120);
      playVideo(VIDEOS.no3, false);
      pendingVideoEndAction.current = 'no_trial_3_done';
    }
  }, [isTransitioning, phase, showDarkroomButtons, stopMusic, stopVideoAudio, playVideo, setZoomTarget, resolveVideoSrc]);

  // Handle hover enter
  const handleHoverEnter = useCallback((type) => {
    if (isTransitioning || !isTrialPhase()) return;

    setHoverState(type);

    if (type === 'yes') {
      playVideo(VIDEOS.yesHover, true);
    } else if (type === 'no') {
      if (phase === PHASES.TRIAL_1_LOOP || phase === PHASES.TRIAL_2_LOOP) {
        playVideo(VIDEOS.noHover1, true);
      } else if (phase === PHASES.TRIAL_3_LOOP) {
        playVideo(VIDEOS.noHover2, true);
      }
    }
  }, [isTransitioning, isTrialPhase, playVideo, phase]);

  // Handle hover leave
  const handleHoverLeave = useCallback(() => {
    if (isTransitioning || !isTrialPhase()) return;

    setHoverState('none');
    playVideo(getLoopVideo(phase), true);
  }, [isTransitioning, isTrialPhase, playVideo, getLoopVideo, phase]);

  // Video ended handler - state machine logic
  const handleVideoEnded = useCallback((e) => {
    // Only handle ended events from the currently active video slot
    const activeRef = activeVideoSlot.current === 'A' ? videoRefA.current : videoRefB.current;
    if (e.target !== activeRef) return;
    const action = pendingVideoEndAction.current;
    pendingVideoEndAction.current = null;

    // Opening video ended
    if (phase === PHASES.OPENING && !action) {
      setPhase(PHASES.TRIAL_1_LOOP);
      playVideo(VIDEOS.loop, true);
      playMusic(AUDIO.song1);
      setZoomTarget(145);
      return;
    }

    // YES video finished
    if (action === 'yes_finished') {
      setPhase(PHASES.FINISHED);
      setFinishedPanel(0);
      setPanelDirection('center');
      setIsTransitioning(false);
      setFinishedLoading(true);
      setLoadingDots('.');
      setHeyLoading(false);
      setHeyLoadingDots('.');
      setTimeout(() => {
        setFinishedLoading(false);
        setHeyLoading(true);
        setTimeout(() => setHeyLoading(false), 3000);
      }, 3000);
      // Play romance music
      if (romanceAudioRef.current) {
        romanceAudioRef.current.src = AUDIO.romance;
        romanceAudioRef.current.volume = 0.4;
        romanceAudioRef.current.loop = true;
        romanceAudioRef.current.load();
        romanceAudioRef.current.play().catch(() => {});
      }
      return;
    }

    // NO trial 1 done
    if (action === 'no_trial_1_done') {
      setPhase(PHASES.TRIAL_2_LOOP);
      setPaperStage(2);
      setIsTransitioning(false);
      playVideo(VIDEOS.loopTired, true);
      playMusic(AUDIO.song2);
      setZoomTarget(145);
      return;
    }

    // NO trial 2 done
    if (action === 'no_trial_2_done') {
      setPhase(PHASES.TRIAL_3_LOOP);
      setPaperStage(3);
      setIsTransitioning(false);
      playVideo(VIDEOS.loopTired2, true);
      playMusic(AUDIO.song3);
      setZoomTarget(145);
      return;
    }

    // NO trial 3 done - enter darkroom
    if (action === 'no_trial_3_done') {
      setPhase(PHASES.DARKROOM_LOOP);
      setPaperStage(0);
      setIsTransitioning(false);
      playVideo(VIDEOS.no4, true);
      setZoomTarget(145);
      // Longer silence before typing increases tension
      setTimeout(startTyping, 3500);
      return;
    }
  }, [phase, playVideo, playMusic, startTyping, setZoomTarget]);

  // Initial mount - preload and start
  useEffect(() => {
    // Preload all videos as blob URLs for seamless transitions
    Object.values(VIDEOS).forEach((src) => {
      fetch(src)
        .then((res) => res.blob())
        .then((blob) => {
          blobUrlCache.current[src] = URL.createObjectURL(blob);
        })
        .catch(() => {});
    });

    // Preload all images
    Object.values(IMAGES).forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    // Preload video audio files so they're cached and decode faster
    Object.values(VIDEO_AUDIO).forEach((src) => {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = src;
    });

    // Start music is now triggered by prestart click

    return () => {
      clearTimeout(typingIntervalRef.current);
      // Revoke blob URLs on unmount
      Object.values(blobUrlCache.current).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  // Handle prestart click
  const handlePrestartClick = useCallback(() => {
    setPhase(PHASES.START);
    playMusic(AUDIO.startSong);
  }, [playMusic]);

  // Render prestart screen
  const renderPrestartScreen = () => {
    if (phase !== PHASES.PRESTART) return null;

    return (
      <div className="prestart-screen" onClick={handlePrestartClick}>
        <div className="prestart-text">Click to run</div>
      </div>
    );
  };

  // Render start screen
  const renderStartScreen = () => {
    if (phase !== PHASES.START) return null;

    const tryPlayStartMusic = () => {
      if (bgMusicRef.current && bgMusicRef.current.paused) {
        bgMusicRef.current.play().catch(() => {});
      }
    };

    return (
      <div className="start-screen" onMouseMove={tryPlayStartMusic} onClick={tryPlayStartMusic} onMouseDown={tryPlayStartMusic}>
        <img
          src={IMAGES.startBg}
          alt="Background"
          className="start-screen-bg"
        />
        <div
          ref={startButtonRef}
          className={`start-button-wrapper${startClicked ? ' start-clicked' : ''}${startHovered ? ' start-hovered' : ''}`}
        >
          <img
            src={IMAGES.startButton}
            alt="Start"
            className="start-button-img"
          />
          <div
            className="start-button-hitbox"
            onClick={handleStartClick}
            onMouseEnter={() => setStartHovered(true)}
            onMouseLeave={() => setStartHovered(false)}
          />
        </div>
      </div>
    );
  };

  // Render paper overlay for trials
  const renderPaper = () => {
    if (!isTrialPhase()) return null;

    const isExiting = isTransitioning && !showPaperClickVideo;
    const noHitboxClass = `hitbox hitbox-no-${paperStage}`;
    const containerClass = `paper-container${isExiting ? ' paper-exit' : ''}${paperStage === 3 ? ' paper-no-anim' : ''}`;

    return (
      <div className={containerClass}>
        <img src={getPaperImage()} alt="Paper" className="paper-image" />
        <div
          className={`hitbox hitbox-yes-${paperStage}`}
          onMouseEnter={() => handleHoverEnter('yes')}
          onMouseLeave={handleHoverLeave}
          onClick={handleYesClick}
        />
        <div
          className={noHitboxClass}
          onMouseEnter={() => handleHoverEnter('no')}
          onMouseLeave={handleHoverLeave}
          onClick={handleNoClick}
        />
      </div>
    );
  };

  // Render darkroom UI
  const renderDarkroom = () => {
    if (phase !== PHASES.DARKROOM_LOOP) return null;

    return (
      <div className="darkroom-container">
        <div className="typewriter-text">
          {TYPEWRITER_TEXT.slice(0, typingIndex)}
          {!isTypingComplete && <span className="cursor">|</span>}
        </div>

        {showDarkroomButtons && (
          <div className="darkroom-buttons">
            <button
              className="darkroom-button"
              onClick={handleYesClick}
              disabled={isTransitioning}
            >
              yes
            </button>
            <button
              className="darkroom-button"
              onClick={handleNoClick}
              disabled={isTransitioning}
            >
              no
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render explosion screen
  const renderExplosion = () => {
    if (phase !== PHASES.EXPLOSION) return null;

    return (
      <div className="explosion-container">
        <video
          ref={explosionVideoRef}
          className="explosion-video"
          muted
          playsInline
        />

        {showExplosionText && (
          <div className="explosion-text">
            ethan chen has died from discombobulation.
          </div>
        )}

        {showRetryButton && (
          <button className="retry-button" onClick={resetAll}>
            RETRY
          </button>
        )}
      </div>
    );
  };

  // Handle next panel in finished screen
  const handleNextPanel = useCallback(() => {
    if (finishedPanel >= FINISHED_PANELS.length - 1) return;

    // Play next sound
    if (nextSoundRef.current) {
      nextSoundRef.current.currentTime = 0;
      nextSoundRef.current.volume = 0.5;
      nextSoundRef.current.play().catch(() => {});
    }

    // Start exit animation (current slides left)
    setPanelDirection('exiting');

    // After exit animation, switch panel and enter from right
    setTimeout(() => {
      setFinishedPanel((prev) => prev + 1);
      setPanelDirection('entering');

      // Trigger enter animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPanelDirection('center');
        });
      });
    }, 600);
  }, [finishedPanel]);

  // Render finished screen
  const renderFinished = () => {
    if (phase !== PHASES.FINISHED) return null;

    const panelClass =
      panelDirection === 'exiting'
        ? 'panel-left'
        : panelDirection === 'entering'
        ? 'panel-right'
        : 'panel-center';

    const isLastPanel = finishedPanel >= FINISHED_PANELS.length - 1;

    if (finishedLoading) {
      return (
        <div className="finished-container">
          <div className="finished-loading-dots">{loadingDots}</div>
        </div>
      );
    }

    if (heyLoading) {
      return (
        <div className="finished-container">
          <div className="finished-loading-dots">hey{heyLoadingDots}</div>
        </div>
      );
    }

    return (
      <div className="finished-container">
        <div className="finished-text">
          Happy (belated) Valentines!
        </div>
        <div className="finished-panel-wrapper">
          <div className={`finished-panel ${panelClass}`}>
            <div className="finished-subtext">
              {FINISHED_PANELS[finishedPanel]}
            </div>
            {!isLastPanel && (
              <button className="finished-next-btn" onClick={handleNextPanel}>
                next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Container class with transitioning state
  const containerClass = `valentine-container${isTransitioning ? ' transitioning' : ''}`;

  return (
    <div className={containerClass}>
      {/* Dual background videos for seamless transitions */}
      <video
        ref={videoRefA}
        className={`background-video${phase === PHASES.YES_SEQUENCE || phase === PHASES.FINISHED ? ' video-cover' : ''}`}
        style={{ zIndex: 2 }}
        muted
        playsInline
        onEnded={handleVideoEnded}
      />
      <video
        ref={videoRefB}
        className={`background-video${phase === PHASES.YES_SEQUENCE || phase === PHASES.FINISHED ? ' video-cover' : ''}`}
        style={{ zIndex: 1 }}
        muted
        playsInline
        onEnded={handleVideoEnded}
      />

      {/* Background music */}
      <audio ref={bgMusicRef} />

      {/* Video audio (synced with video) */}
      <audio ref={videoAudioRef} />

      {/* Typewriter sound */}
      <audio ref={typewriterSoundRef} src={AUDIO.typewriter} />

      {/* Romance music for finished screen */}
      <audio ref={romanceAudioRef} />

      {/* Next button sound */}
      <audio ref={nextSoundRef} src={AUDIO.next} preload="auto" />

      {/* Skip button for opening animation */}
      {phase === PHASES.OPENING && (
        <button className="skip-button" onClick={handleSkipOpening}>
          skip
        </button>
      )}

      {/* Prestart screen */}
      {renderPrestartScreen()}

      {/* Start screen */}
      {renderStartScreen()}

      {/* Paper overlay for trials */}
      {renderPaper()}

      {/* Paper click animation video */}
      {showPaperClickVideo && (
        <div className="paper-click-video-container">
          <video
            ref={paperClickVideoRef}
            className="paper-click-video"
            muted
            playsInline
            onEnded={handlePaperClickEnded}
          />
        </div>
      )}

      {/* Darkroom UI */}
      {renderDarkroom()}

      {/* Explosion screen */}
      {renderExplosion()}

      {/* Finished screen */}
      {renderFinished()}
    </div>
  );
}

export default App;
