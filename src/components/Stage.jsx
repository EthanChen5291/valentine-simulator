// The two stacked background videos that make up the visual stage. They sit
// behind every other screen; the active hook decides which one is on top.
export default function Stage({ videoRefA, videoRefB, cover, onEnded }) {
  const className = `background-video${cover ? ' video-cover' : ''}`;
  return (
    <>
      <video
        ref={videoRefA}
        className={className}
        style={{ zIndex: 2 }}
        muted
        playsInline
        onEnded={onEnded}
      />
      <video
        ref={videoRefB}
        className={className}
        style={{ zIndex: 1 }}
        muted
        playsInline
        onEnded={onEnded}
      />
    </>
  );
}
