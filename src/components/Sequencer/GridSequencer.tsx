import { el, ElemNode } from "@elemaudio/core";
import clap from "../../lib/sounds/clap";
import hat from "../../lib/sounds/hat";
import { kick } from "../../lib/sounds/kick";
import Grid from "../Grid/Grid";
import { useEffect, useRef, useState } from "react";
import { Instrument, useSequencer } from "../../lib/useSequencer";
import { useAudioContext } from "../../lib/useAudioContext";
import { useWebRenderer } from "../../lib/useWebRenderer";
import Controllers from "../Controllers/Controllers";
import Knob from "../Knob/Knob";

const DEFAULT_STEPS = 8;
const DEFAULT_BPM = 80;

const instrumentDefs: Instrument[] = [
  {
    key: "clap",
    name: "Clap",
    seqOptions: {},
    volume: 0.6,
    makeNode: (seq: any) => clap(800, 0.02, 0.2, seq),
  },
  {
    key: "hat",
    name: "Hat",
    seqOptions: {},
    volume: 0.75,
    makeNode: (seq: any) =>
      hat(
        // small LFO-style modulation examples implemented in-line
        el.add(317, el.mul(900, el.cycle(1))),
        el.add(14000, el.mul(4000, el.cycle(4.5))),
        0.005,
        el.add(0.5, el.mul(0.45, el.cycle(4.1))),
        seq
      ),
  },
  {
    key: "kick",
    name: "kick",
    seqOptions: {},
    volume: 0.9,
    makeNode: (seq: any) =>
      kick(el.const({ value: 0 }), seq, "kick", { gain: 0.8, pop: 1.2 }),
  },
];

const setupGrid = (rows: number, columns: number) => {
  return Array(rows)
    .fill(0)
    .map(() => Array(columns).fill(false));
};

export default function GridSequencer() {
  const { ctxRef, resume } = useAudioContext();
  const { initRenderer } = useWebRenderer(ctxRef);
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [mute, setMute] = useState(false);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [instrumentConfig, setInstrumentConfig] = useState(instrumentDefs);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [instrumentGrid, setInstrumentGrid] = useState<boolean[][]>(
    setupGrid(instrumentConfig.length, steps)
  );

  const { loadSample } = useSequencer({
    steps: instrumentGrid.map((row) => row.map((v) => Number(v))),
    instruments: instrumentConfig,
    bpm,
    mute,
    beatsPerBar,
  });

  useEffect(() => {
    setInstrumentGrid(setupGrid(instrumentConfig.length, steps));
  }, [steps]);

  // Ensure renderer is initialized once AudioContext exists
  useEffect(() => {
    (async () => {
      if (ctxRef.current) {
        try {
          await resume();
          await initRenderer();
        } catch (e) {
          console.warn("Renderer init failed:", e);
        }
      }
    })();
  }, [ctxRef.current]);

  const handleAddSampleClick = () => {
    fileInputRef.current?.click();
  };

  const handleSampleChosen: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const file = e.target.files?.[0];
    // Reset the input so the same file can be re-selected later
    e.currentTarget.value = "";
    if (!file) return;

    try {
      const ctx = ctxRef.current;
      if (!ctx) throw new Error("AudioContext not ready");

      const { vfsKey, name } = await loadSample(ctx, file);

      const newInstrument: Instrument = {
        key: vfsKey,
        name,
        volume: 1,
        muted: false,
        makeNode: (seq: any) => el.sample({ path: vfsKey }, seq, 1),
      };

      setInstrumentConfig((prev) => [...prev, newInstrument]);
      // Add a new row to the grid for the new instrument
      setInstrumentGrid((prev) => {
        const cols = prev[0]?.length ?? steps;
        return [...prev, Array(cols).fill(false)];
      });
    } catch (err) {
      console.error("Failed to load sample:", err);
    }
  };

  return (
    <div className="app-container">
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={handleAddSampleClick}>Add Sample</button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          style={{ display: "none" }}
          onChange={handleSampleChosen}
        />
      </div>
      <Controllers
        steps={steps}
        setSteps={setSteps}
        bpm={bpm}
        setBpm={setBpm}
        mute={mute}
        setMute={setMute}
        beatsPerBar={beatsPerBar}
        setBeatsPerBar={setBeatsPerBar}
      />
      {(() => {
        const setInstrumentVolumeAt = (idx: number, vol: number) => {
          setInstrumentConfig((prev) =>
            prev.map((inst, i) => (i === idx ? { ...inst, volume: vol } : inst))
          );
        };
        const setInstrumentMutedAt = (idx: number, muted: boolean) => {
          setInstrumentConfig((prev) =>
            prev.map((inst, i) => (i === idx ? { ...inst, muted } : inst))
          );
        };
        const deleteInstrumentAt = (idx: number) => {
          setInstrumentConfig((prev) => prev.filter((_, i) => i !== idx));
          setInstrumentGrid((prev) => prev.filter((_, i) => i !== idx));
        };

        const headers = instrumentConfig.map((inst, idx) => (
          <div key={`inst-header-${idx}`}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Knob
                value={inst.volume ?? 1}
                onChange={(v) => setInstrumentVolumeAt(idx, v)}
                size={24}
                sensitivity={2}
              />
              <p className="instrument" style={{ margin: 0, flex: 1 }} title={inst.name}>
                {inst.name}
              </p>
              <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  type="checkbox"
                  checked={!!inst.muted}
                  onChange={(e) => setInstrumentMutedAt(idx, e.target.checked)}
                />
                <span style={{ color: "#ccc", fontSize: 12 }}>M</span>
              </label>
              <button
                onClick={() => deleteInstrumentAt(idx)}
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
        ));

        return (
          <Grid data={instrumentGrid} handleChange={setInstrumentGrid} headers={headers} />
        );
      })()}
    </div>
  );
}
