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
  onExport?: () => void;
  isExporting?: boolean;
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
  onExport,
  isExporting = false,
}: ControllersProps) {
  return (
    <div className="controllers">
      <div className="controller-item">
        <label htmlFor="steps">Steps</label>
        <input
          aria-label="steps"
          min={1}
          id="steps"
          value={steps}
          type="number"
          onChange={(e) => setSteps(Number(e.target.value))}
        />
      </div>
      <div className="controller-item">
        <label
          htmlFor="beatPerBar"
          title="Steps per beat (1=♩, 2=♪, 4=♬, 8=♬♬)"
        >
          Steps/Beat
        </label>
        <input
          aria-label="steps per beat"
          min={1}
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
          min={1}
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
      {onExport && (
        <div className="controller-item">
          <label>&nbsp;</label>
          <button
            className="button-primary"
            onClick={onExport}
            disabled={isExporting}
            aria-label="export pattern"
          >
            {isExporting ? "Exporting..." : "Export"}
          </button>
        </div>
      )}
    </div>
  );
}
