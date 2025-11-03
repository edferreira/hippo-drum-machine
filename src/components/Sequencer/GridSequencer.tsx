import { el, ElemNode } from "@elemaudio/core";
import clap from "../../lib/sounds/clap";
import hat from "../../lib/sounds/hat";
import "./GridSequencer.css";
import { kick } from "../../lib/sounds/kick";
import Grid from "../Grid/Grid";
import { useEffect, useState } from "react";
import { Instrument, useSequencer } from "../../lib/useSequencer";

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
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [mute, setMute] = useState(false);
  const [instrumentConfig, setInstrumentConfig] = useState(instrumentDefs);

  const [instrumentGrid, setInstrumentGrid] = useState<boolean[][]>(
    setupGrid(instrumentConfig.length, steps)
  );

  useSequencer({
    steps: instrumentGrid.map((row) => row.map((v) => Number(v))),
    instruments: instrumentConfig,
    bpm,
    mute,
  });

  useEffect(() => {
    setInstrumentGrid(setupGrid(instrumentConfig.length, steps));
  }, [steps]);

  return (
    <div>
      <input
        aria-label="steps"
        min={2}
        max={24}
        id="steps"
        value={steps}
        type="number"
        onChange={(e) => setSteps(Number(e.target.value))}
      />
      <input
        aria-label="bpm"
        id="bpm"
        value={bpm}
        type="number"
        onChange={(e) => setBpm(Number(e.target.value))}
      />
      <input
        aria-label="mute"
        id="mute"
        onChange={(e) => setMute(e.target.checked)}
        type="checkbox"
      />
      <Grid
        data={instrumentGrid}
        handleChange={setInstrumentGrid}
        headers={instrumentConfig.map((i) => i.name)}
      />
    </div>
  );
}
