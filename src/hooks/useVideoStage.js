import { useCallback, useEffect, useRef } from 'react';
import { VIDEOS, VIDEO_AUDIO } from '../config/assets';

// Drives the visual stage: two stacked <video> elements that crossfade so one
// clip can hand off to the next without a flash of black, plus a companion
// <audio> element for clips whose soundtrack is stored separately.
//
// The hook owns all of the playback machinery and hands back the refs to wire
// up in the DOM along with a small command surface (playVideo / stop / reset).
export function useVideoStage() {
  const videoRefA = useRef(null);
  const videoRefB = useRef(null);
  const videoAudioRef = useRef(null);

  // Which of the two slots is currently the visible one.
  const activeSlot = useRef('A');

  // Decoded clips are cached as blob URLs so transitions are instant.
  const blobCache = useRef({});

  // Bumped on every playVideo call so callbacks from a superseded call bail out.
  const generation = useRef(0);

  const resolveSrc = useCallback((src) => blobCache.current[src] || src, []);

  const stopVideoAudio = useCallback(() => {
    if (videoAudioRef.current) {
      videoAudioRef.current.pause();
      videoAudioRef.current.currentTime = 0;
    }
  }, []);

  // True when the given element is the slot currently on screen. Used to ignore
  // "ended" events fired by the hidden slot.
  const isActiveVideo = useCallback((el) => {
    const active = activeSlot.current === 'A' ? videoRefA.current : videoRefB.current;
    return el === active;
  }, []);

  const getSlots = useCallback(() => {
    const aIsActive = activeSlot.current === 'A';
    return {
      active: aIsActive ? videoRefA.current : videoRefB.current,
      inactive: aIsActive ? videoRefB.current : videoRefA.current,
      nextSlot: aIsActive ? 'B' : 'A',
    };
  }, []);

  // Load the next clip onto the hidden slot, then swap it to the front once it
  // (and any synced audio) is ready to play.
  const playVideo = useCallback((src, loop = false) => {
    stopVideoAudio();
    const audioSrc = VIDEO_AUDIO[src];
    const resolvedSrc = resolveSrc(src);

    const gen = ++generation.current;
    const { active, inactive, nextSlot } = getSlots();
    if (!inactive) return;

    inactive.src = resolvedSrc;
    inactive.loop = loop;
    inactive.load();

    const swapToFront = () => {
      if (gen !== generation.current) return; // superseded by a newer call
      inactive.style.zIndex = '2';
      active.style.zIndex = '1';
      activeSlot.current = nextSlot;
      // Let the swap settle before pausing the outgoing clip to avoid a flicker.
      setTimeout(() => active.pause(), 100);
    };

    if (audioSrc && videoAudioRef.current) {
      const audio = videoAudioRef.current;
      audio.src = audioSrc;
      audio.loop = loop;
      audio.volume = audioSrc.includes('VALENTINE_no_hover_1') ? 0.6 : 1.0;
      audio.load();

      let videoReady = false;
      let audioReady = false;

      const startBoth = () => {
        if (gen !== generation.current) return;
        if (!videoReady || !audioReady) return;
        inactive.currentTime = 0;
        audio.currentTime = 0;
        inactive.play().catch(() => {});
        audio.play().catch(() => {});
        swapToFront();
      };

      const onVideoReady = () => {
        videoReady = true;
        inactive.removeEventListener('canplaythrough', onVideoReady);
        startBoth();
      };
      const onAudioReady = () => {
        audioReady = true;
        audio.removeEventListener('canplaythrough', onAudioReady);
        startBoth();
      };

      // Register listeners first, then check readyState — after load() the state
      // resets, but cached blob URLs can resolve synchronously.
      inactive.addEventListener('canplaythrough', onVideoReady, { once: true });
      audio.addEventListener('canplaythrough', onAudioReady, { once: true });
      if (inactive.readyState >= 4) onVideoReady();
      if (audio.readyState >= 4) onAudioReady();
    } else {
      const onReady = () => {
        if (gen !== generation.current) return;
        inactive.removeEventListener('canplaythrough', onReady);
        inactive.currentTime = 0;
        inactive.play().catch(() => {});
        swapToFront();
      };
      inactive.addEventListener('canplaythrough', onReady, { once: true });
      if (inactive.readyState >= 4) onReady();
    }
  }, [stopVideoAudio, resolveSrc, getSlots]);

  // Tear the stage back down to its initial state (used by retry / reset).
  const resetStage = useCallback(() => {
    stopVideoAudio();
    if (videoRefA.current) {
      videoRefA.current.pause();
      videoRefA.current.removeAttribute('src');
      videoRefA.current.style.zIndex = '2';
    }
    if (videoRefB.current) {
      videoRefB.current.pause();
      videoRefB.current.removeAttribute('src');
      videoRefB.current.style.zIndex = '1';
    }
    activeSlot.current = 'A';
  }, [stopVideoAudio]);

  // Decode every clip into a blob URL up front so no transition has to wait on
  // the network, and warm the standalone audio tracks at the same time.
  useEffect(() => {
    const cache = blobCache.current;

    Object.values(VIDEOS).forEach((src) => {
      fetch(src)
        .then((res) => res.blob())
        .then((blob) => { cache[src] = URL.createObjectURL(blob); })
        .catch(() => {});
    });

    Object.values(VIDEO_AUDIO).forEach((src) => {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = src;
    });

    return () => {
      Object.values(cache).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  return {
    videoRefA,
    videoRefB,
    videoAudioRef,
    isActiveVideo,
    playVideo,
    resolveSrc,
    stopVideoAudio,
    resetStage,
  };
}
