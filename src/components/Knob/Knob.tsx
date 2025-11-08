import { useCallback, useRef, useState } from "react";

type KnobProps = {
  value: number; // 0..1
  onChange: (v: number) => void;
  size?: number;
  sensitivity?: number; // px per 0.01 change
  min?: number;
  max?: number;
  showValue?: boolean;
  format?: (v: number) => string;
};

export default function Knob({
  value,
  onChange,
  size = 28,
  sensitivity = 8,
  min = 0,
  max = 1,
  showValue = true,
  format,
}: KnobProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const startY = useRef<number | null>(null);
  const startValue = useRef<number>(value);
  const dragging = useRef<boolean>(false);
  const [active, setActive] = useState(false);

  const clamp = useCallback(
    (v: number) => Math.min(max, Math.max(min, v)),
    [min, max]
  );

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragging.current = true;
    startY.current = e.clientY;
    startValue.current = value;
    setActive(true);
    ref.current?.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging.current || startY.current == null) return;
    const dy = startY.current - e.clientY; // up positive
    const delta = (dy / sensitivity) * 0.01; // 100 px ~ 1.25 depending on sensitivity
    const next = clamp(startValue.current + delta);
    if (next !== value) onChange(parseFloat(next.toFixed(3)));
    e.preventDefault();
  };

  const endDrag: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    startY.current = null;
    setActive(false);
    ref.current?.releasePointerCapture(e.pointerId);
    e.preventDefault();
  };

  // Map value [min,max] to angle [-135, 135]
  const norm = (value - min) / (max - min || 1);
  const angle = -135 + norm * 270;

  const knobStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    background: active ? "#6b6b85" : "#5c5c71",
    border: "1px solid #8888a0",
    position: "relative",
    touchAction: "none",
    cursor: "ns-resize",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const indicatorStyle: React.CSSProperties = {
    width: 2,
    height: size * 0.4,
    background: "#fff",
    transform: `rotate(${angle}deg) translateY(${-size * 0.18}px)`,
    transformOrigin: "bottom center",
    borderRadius: 1,
    position: "absolute",
    bottom: size * 0.5,
  };

  return (
    <div
      ref={ref}
      style={knobStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div style={indicatorStyle} />
      {showValue && (
        <span
          style={{
            position: "absolute",
            fontSize: Math.max(9, Math.round(size * 0.38)),
            color: "#fff",
            userSelect: "none",
          }}
        >
          {format ? format(value) : value.toFixed(2)}
        </span>
      )}
    </div>
  );
}
