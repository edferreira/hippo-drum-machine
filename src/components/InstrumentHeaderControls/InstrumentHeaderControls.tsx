import Knob from "../Knob/Knob";
import "./InstrumentHeaderControls.css";

type Props = {
  name: string;
  volume: number;
  muted: boolean;
  onChangeVolume: (v: number) => void;
  onToggleMute: (v: boolean) => void;
  onDelete: () => void;
  knobSize?: number;
  knobSensitivity?: number;
  className?: string;
};

export default function InstrumentHeaderControls({
  name,
  volume,
  muted,
  onChangeVolume,
  onToggleMute,
  onDelete,
  knobSize = 24,
  knobSensitivity = 2,
  className,
}: Props) {
  return (
    <div className={className}>
      <div className="instrument-header-controls">
        <Knob
          value={volume}
          onChange={onChangeVolume}
          size={knobSize}
          sensitivity={knobSensitivity}
          format={(v) => `${Math.round(v * 100)}%`}
          showValue={false}
        />
        <p className="instrument instrument-name" title={name}>
          {name}
        </p>
        <label className="instrument-mute-label">
          <input
            type="checkbox"
            checked={!!muted}
            onChange={(e) => onToggleMute(e.target.checked)}
          />
          <span className="instrument-mute-text">M</span>
        </label>
        <button
          onClick={onDelete}
          title="Delete track"
          className="instrument-delete-button"
        >
          ×
        </button>
      </div>
    </div>
  );
}
