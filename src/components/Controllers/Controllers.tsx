import "./Controllers.css";

type ControllersProps = {
  steps: number;
  setSteps: (steps: number) => void;
  bpm: number;
  setBpm: (bpm: number) => void;
  beatsPerBar: number;
  setBeatsPerBar: (beatPerBar: number) => void;
  mute: boolean;
  setMute: (mute: boolean) => void;
};

export default function Controllers({
  steps,
  setSteps,
  bpm,
  setBpm,
  mute,
  setMute,
  beatsPerBar,
  setBeatsPerBar,
}: ControllersProps) {
  return (
    <div className="controllers">
      <div className="controller-item">
        <label htmlFor="steps">Steps</label>
        <input
          aria-label="steps"
          min={2}
          max={24}
          id="steps"
          value={steps}
          type="number"
          onChange={(e) => setSteps(Number(e.target.value))}
        />
      </div>
      <div className="controller-item">
        <label htmlFor="beatPerBar">BPB</label>
        <input
          aria-label="beats per bar"
          min={1}
          max={24}
          id="beatPerBar"
          value={beatsPerBar}
          type="number"
          onChange={(e) => setBeatsPerBar(Number(e.target.value))}
        />
      </div>
      <div className="controller-item">
        <label htmlFor="bpm">BPM</label>
        <input
          aria-label="bpm"
          id="bpm"
          min={0}
          max={400}
          value={bpm}
          type="number"
          onChange={(e) => setBpm(Number(e.target.value))}
        />
      </div>
      <div className="controller-item">
        <label htmlFor="mute">Mute</label>
        <input
          aria-label="mute"
          id="mute"
          checked={mute}
          onChange={(e) => setMute(e.target.checked)}
          type="checkbox"
        />
      </div>
    </div>
  );
}
