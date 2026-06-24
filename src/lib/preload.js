// Kick off image downloads so the hand-drawn frames are already in the browser
// cache by the time a phase needs to show them.
export function preloadImages(sources) {
  sources.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}
