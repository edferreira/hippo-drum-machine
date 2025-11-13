import { el, ElemNode } from "@elemaudio/core";
import clap from "../../lib/sounds/clap";
import hat from "../../lib/sounds/hat";
import { kick } from "../../lib/sounds/kick";
import Grid from "../Grid/Grid";
import { useEffect, useRef, useState } from "react";
import { Instrument, useSequencer } from "../../lib/useSequencer";
import { useAudioEngine } from "../../lib/useAudioEngine";
import { useInstruments } from "../../lib/useInstruments";
import {
  addSample,
  listSamples,
  updateSample,
  deleteSample,
} from "../../lib/storage/samplesDB";
import Controllers from "../Controllers/Controllers";
import InstrumentHeaderControls from "../InstrumentHeaderControls/InstrumentHeaderControls";
import SampleUploadButton from "../SampleUploadButton/SampleUploadButton";

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
  const { ctxRef, ensureReady } = useAudioEngine();
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [mute, setMute] = useState(false);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const {
    instruments: instrumentConfig,
    setSteps: setTrackSteps,
    grid: instrumentGrid,
    setGrid,
    setVolumeAt,
    setMutedAt,
    deleteAt,
    addInstrument,
  } = useInstruments(instrumentDefs, steps);

  const { loadSample, loadSampleBlob } = useSequencer({
    steps: instrumentGrid.map((row) => row.map((v) => Number(v))),
    instruments: instrumentConfig,
    bpm,
    mute,
    beatsPerBar,
  });

  useEffect(() => {
    // propagate steps change to instrument grid manager
    setTrackSteps(steps);
  }, [steps, setTrackSteps]);

  // Engine initialization is handled by useAudioEngine

  // On mount: load persisted samples and rehydrate instruments
  useEffect(() => {
    (async () => {
      try {
        await ensureReady();
        const ctx = ctxRef.current;
        if (!ctx) return;
        const records = await listSamples();
        for (const rec of records) {
          const { vfsKey, name } = await loadSampleBlob(
            ctx,
            rec.blob,
            rec.name
          );
          const inst: Instrument = {
            key: vfsKey,
            name,
            volume: rec.volume,
            muted: rec.muted,
            dbId: rec.id,
            makeNode: (seq: any) => el.sample({ path: vfsKey }, seq, 1),
          };
          addInstrument(inst);
        }
      } catch (e) {
        console.warn("Failed to load persisted samples:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePick = async (file: File) => {
    try {
      await ensureReady();
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

      // Persist the uploaded sample (store original file blob)
      try {
        const dbId = await addSample({
          name,
          blob: file,
          volume: 1,
          muted: false,
        });
        newInstrument.dbId = dbId;
      } catch (e) {
        console.warn("Failed to persist sample:", e);
      }

      addInstrument(newInstrument);
    } catch (err) {
      console.error("Failed to load sample:", err);
    }
  };

  return (
    <div className="app-container">
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <SampleUploadButton onPick={handlePick} />
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
        return (
          <Grid
            data={instrumentGrid}
            beatsPerBar={beatsPerBar}
            handleChange={setGrid}
            renderHeader={(idx) => {
              const inst = instrumentConfig[idx];
              if (!inst) return null;
              return (
                <InstrumentHeaderControls
                  name={inst.name}
                  volume={inst.volume ?? 1}
                  muted={!!inst.muted}
                  onChangeVolume={async (v) => {
                    setVolumeAt(idx, v);
                    if (inst.dbId != null) {
                      try {
                        await updateSample(inst.dbId as number, { volume: v });
                      } catch {}
                    }
                  }}
                  onToggleMute={async (b) => {
                    setMutedAt(idx, b);
                    if (inst.dbId != null) {
                      try {
                        await updateSample(inst.dbId as number, { muted: b });
                      } catch {}
                    }
                  }}
                  onDelete={async () => {
                    if (inst.dbId != null) {
                      try {
                        await deleteSample(inst.dbId as number);
                      } catch {}
                    }
                    deleteAt(idx);
                  }}
                />
              );
            }}
          />
        );
      })()}
    </div>
  );
}
