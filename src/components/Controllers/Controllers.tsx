import "./Controllers.css";
import Knob from "../Knob/Knob";
import { PRESETS } from "../../config/presets";

type ControllersProps = {
  steps: number;
  setSteps: (steps: number) => void;
  bpm: number;
  setBpm: (bpm: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
  beatsPerBar: number;
  setBeatsPerBar: (beatPerBar: number) => void;
  mute: boolean;
  setMute: (mute: boolean) => void;
  onSelectPreset?: (presetIndex: number) => void;
  onRestart?: () => void;
  onExport?: () => void;
  isExporting?: boolean;
};

export default function Controllers({
  steps,
  setSteps,
  bpm,
  setBpm,
  volume,
  setVolume,
  mute,
  setMute,
  beatsPerBar,
  setBeatsPerBar,
  onSelectPreset,
  onRestart,
  onExport,
  isExporting = false,
}: ControllersProps) {
  return (
    <div className="controllers">
      {onSelectPreset && (
        <div className="controller-item">
          <label htmlFor="preset">Preset</label>
          <select
            id="preset"
            aria-label="preset"
            onChange={(e) => {
              const idx = Number(e.target.value);
              if (idx >= 0) onSelectPreset(idx);
              e.target.value = "-1";
            }}
            defaultValue="-1"
          >
            <option value="-1" disabled>
              Select...
            </option>
            {PRESETS.map((p, i) => (
              <option key={i} value={i}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}
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
      <div className="controller-item" style={{ alignItems: 'center' }}>
        <label>Vol</label>
        <Knob
          value={volume}
          onChange={setVolume}
          size={36}
          min={0}
          max={1}
          format={(v) => Math.round(v * 100) + '%'}
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
      {onRestart && (
        <div className="controller-item">
          <label>&nbsp;</label>
          <button
            className="button-primary"
            onClick={onRestart}
            aria-label="restart pattern"
          >
            Restart
          </button>
        </div>
      )}
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
