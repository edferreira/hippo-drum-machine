import Knob from "../Knob/Knob";

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
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Knob
          value={volume}
          onChange={onChangeVolume}
          size={knobSize}
          sensitivity={knobSensitivity}
          format={(v) => `${Math.round(v * 100)}%`}
          showValue={false}
        />
        <p className="instrument" style={{ margin: 0, flex: 1 }} title={name}>
          {name}
        </p>
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input
            type="checkbox"
            checked={!!muted}
            onChange={(e) => onToggleMute(e.target.checked)}
          />
          <span style={{ color: "#ccc", fontSize: 12 }}>M</span>
        </label>
        <button
          onClick={onDelete}
          title="Delete track"
          style={{
            background: "transparent",
            border: "1px solid #5c5c71",
            color: "#ddd",
            borderRadius: 4,
            padding: "2px 6px",
            lineHeight: 1,
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
