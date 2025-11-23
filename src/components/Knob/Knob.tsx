import { useCallback, useRef, useState } from "react";
import "./Knob.css";

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
    const delta = (dy / sensitivity) * 0.01;
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

  // CSS variables for dynamic values
  const cssVars = {
    "--knob-size": `${size}px`,
    "--indicator-height": `${size * 0.4}px`,
    "--indicator-angle": `${angle}deg`,
    "--indicator-offset": `${-size * 0.18}px`,
    "--indicator-bottom": `${size * 0.5}px`,
    "--value-font-size": `${Math.max(9, Math.round(size * 0.38))}px`,
  } as React.CSSProperties;

  const formattedValue = format ? format(value) : value.toFixed(2);

  return (
    <div
      ref={ref}
      className={`knob ${active ? "knob--active" : ""}`}
      style={cssVars}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={`Volume control: ${formattedValue}`}
      title={formattedValue}
    >
      <div className="knob__indicator" />
      {showValue && <span className="knob__value">{formattedValue}</span>}
    </div>
  );
}
