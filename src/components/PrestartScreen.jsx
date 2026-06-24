// A bare click-to-begin gate. Browsers block autoplaying audio until the user
// interacts, so this first click is what lets the soundtrack start.
export default function PrestartScreen({ onStart }) {
  return (
    <div className="prestart-screen" onClick={onStart}>
      <div className="prestart-text">Click to run</div>
    </div>
  );
}
