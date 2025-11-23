import { el } from "@elemaudio/core";
import clap from "../../lib/sounds/clap";
import hat from "../../lib/sounds/hat";
import { kick } from "../../lib/sounds/kick";
import { useEffect, useState, lazy, Suspense, useCallback } from "react";

// Lazy load Grid component for code splitting
const Grid = lazy(() => import("../Grid/Grid"));
import { useSequencer } from "../../lib/useSequencer";
import type { Instrument } from "../../types/audio";
import { useAudio } from "../../contexts/AudioContext";
import { useInstruments } from "../../lib/useInstruments";
import {
  loadSampleFromFile,
  loadSampleFromBlob,
} from "../../lib/audioSampleLoader";
import {
  addSample,
  listSamples,
  updateSample,
  deleteSample,
} from "../../lib/storage/samplesDB";
import {
  loadTrack,
  buildGridFromPersisted,
  saveTrack,
  serializeInstruments,
} from "../../lib/storage/trackStorage";
import type { PersistedTrack } from "../../types/audio";
import Controllers from "../Controllers/Controllers";
import InstrumentHeaderControls from "../InstrumentHeaderControls/InstrumentHeaderControls";
import SampleUploadButton from "../SampleUploadButton/SampleUploadButton";
import { useAudioExport } from "../../lib/useAudioExport";
import { getAudioNode } from "../../lib/webRenderer";
import "./GridSequencer.css";

const DEFAULT_STEPS = 16;
const DEFAULT_BPM = 120;

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

export default function GridSequencer() {
  const { audioContext, ensureReady } = useAudio();

  // Load saved track once on mount to initialize state
  const savedTrack = loadTrack();
  const [steps, setSteps] = useState(savedTrack?.steps ?? DEFAULT_STEPS);
  const [bpm, setBpm] = useState(savedTrack?.bpm ?? DEFAULT_BPM);
  const [mute, setMute] = useState(savedTrack?.mute ?? false);
  const [beatsPerBar, setBeatsPerBar] = useState(savedTrack?.beatsPerBar ?? 4);
  const [hasRestoredGrid, setHasRestoredGrid] = useState(false);

  // Audio export hook - pass the audioContext from context
  const { connectRecorder, exportPattern, isExporting } =
    useAudioExport(audioContext);

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

  useSequencer({
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

  // Connect audio export recorder when audio node is available
  useEffect(() => {
    (async () => {
      try {
        await ensureReady();
        const audioNode = getAudioNode();
        if (audioNode && audioContext) {
          connectRecorder(audioNode);
        }
      } catch (error) {
        console.error("Failed to connect audio export recorder:", error);
      }
    })();
  }, [ensureReady, connectRecorder]);

  // On mount: load persisted samples and rehydrate instruments
  useEffect(() => {
    (async () => {
      try {
        await ensureReady();
        if (!audioContext) return;
        const records = await listSamples();
        for (const rec of records) {
          const { vfsKey, name } = await loadSampleFromBlob(
            audioContext,
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

  useEffect(() => {
    if (!savedTrack || hasRestoredGrid) return;

    if (instrumentConfig.length === 0) return;

    const wantedSampleIds = new Set(
      savedTrack.instruments
        .filter((p) => p.kind === "sample" && p.dbId != null)
        .map((p) => p.dbId as number)
    );
    const presentSampleIds = new Set(
      instrumentConfig
        .filter((i) => i.dbId != null)
        .map((i) => i.dbId as number)
    );

    const hasMissingSamples = Array.from(wantedSampleIds).some(
      (id) => !presentSampleIds.has(id)
    );
    if (hasMissingSamples && wantedSampleIds.size > 0) {
      return;
    }

    const restoredGrid = buildGridFromPersisted(instrumentConfig, savedTrack);

    setGrid(restoredGrid);

    instrumentConfig.forEach((inst, idx) => {
      const match = savedTrack.instruments.find((p) =>
        inst.dbId != null
          ? p.kind === "sample" && p.dbId === inst.dbId
          : p.kind === "builtin" && p.key === inst.key
      );
      if (!match) return;
      if (inst.dbId == null) {
        if (typeof match.volume === "number" && match.volume !== inst.volume) {
          setVolumeAt(idx, match.volume);
        }
        if (typeof match.muted === "boolean" && match.muted !== inst.muted) {
          setMutedAt(idx, match.muted);
        }
      }
    });

    setHasRestoredGrid(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRestoredGrid]);

  const handlePick = async (file: File) => {
    try {
      await ensureReady();
      if (!audioContext) throw new Error("AudioContext not ready");

      const { vfsKey, name } = await loadSampleFromFile(audioContext, file);

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

  const handleExport = async () => {
    try {
      await ensureReady();
      if (!audioContext) return;

      // Calculate duration for one complete cycle through all steps
      // stepHz = (bpm / 60) * (steps / beatsPerBar)
      // One cycle duration = steps / stepHz = steps / ((bpm / 60) * (steps / beatsPerBar))
      // Simplified: (steps * beatsPerBar * 60) / (bpm * steps) = (beatsPerBar * 60) / bpm
      const stepHz = (bpm / 60) * (steps / beatsPerBar);
      const durationSeconds = steps / stepHz;

      // Generate filename with timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      const filename = `drum-pattern-${timestamp}.webm`;

      await exportPattern(durationSeconds, filename);
    } catch (error) {
      console.error("Failed to export audio:", error);
    }
  };

  useEffect(() => {
    if (savedTrack && !hasRestoredGrid) {
      return;
    }

    try {
      const instruments = serializeInstruments(
        instrumentConfig,
        instrumentGrid,
        steps
      );
      const payload: PersistedTrack = {
        version: 1,
        steps,
        bpm,
        beatsPerBar,
        mute,
        instruments,
        savedAt: Date.now(),
      };
      saveTrack(payload);
    } catch {}
  }, [
    instrumentConfig,
    instrumentGrid,
    steps,
    bpm,
    beatsPerBar,
    mute,
    hasRestoredGrid,
    savedTrack,
  ]);

  const renderHeader = useCallback(
    (idx: number) => {
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
    },
    [instrumentConfig, setVolumeAt, setMutedAt, deleteAt]
  );

  return (
    <div className="app-container">
      <div className="sequencer-header">
        <SampleUploadButton onPick={handlePick} />
        <Controllers
          steps={steps}
          setSteps={setSteps}
          bpm={bpm}
          setBpm={setBpm}
          mute={mute}
          setMute={setMute}
          beatsPerBar={beatsPerBar}
          setBeatsPerBar={setBeatsPerBar}
          onExport={handleExport}
          isExporting={isExporting}
        />
      </div>
      <Suspense
        fallback={<div className="loading-grid">Loading sequencer...</div>}
      >
        <Grid
          data={instrumentGrid}
          beatsPerBar={beatsPerBar}
          handleChange={setGrid}
          renderHeader={renderHeader}
        />
      </Suspense>
    </div>
  );
}
