import { useEffect, useState, lazy, Suspense, useCallback } from "react";

// Lazy load Grid component for code splitting
const Grid = lazy(() => import("../Grid/Grid"));
import { useSequencer } from "../../lib/useSequencer";
import type { Instrument } from "../../types/audio";
import { useAudio } from "../../contexts/AudioContext";
import { useInstruments } from "../../lib/useInstruments";
import { useSampleManagement } from "../../lib/useSampleManagement";
import { useTrackPersistence } from "../../lib/useTrackPersistence";
import {
  listSamples,
  updateSample,
  deleteSample,
} from "../../lib/storage/samplesDB";
import { loadTrack } from "../../lib/storage/trackStorage";
import { calculatePatternDuration } from "../../lib/utils/timing";
import {
  DEFAULT_STEPS,
  DEFAULT_BPM,
  DEFAULT_BEATS_PER_BAR,
  DEFAULT_MUTE,
  AUDIO_EXPORT_FILENAME_PREFIX,
  AUDIO_EXPORT_FORMAT,
} from "../../lib/constants";
import { DEFAULT_INSTRUMENTS } from "../../config/instruments";
import Controllers from "../Controllers/Controllers";
import InstrumentHeaderControls from "../InstrumentHeaderControls/InstrumentHeaderControls";
import SampleUploadButton from "../SampleUploadButton/SampleUploadButton";
import { useAudioExport } from "../../lib/useAudioExport";
import { getAudioNode } from "../../lib/webRenderer";
import "./GridSequencer.css";

export default function GridSequencer() {
  const { audioContext, ensureReady } = useAudio();

  // Load saved track once on mount to initialize state
  const savedTrack = loadTrack();
  const [steps, setSteps] = useState(savedTrack?.steps ?? DEFAULT_STEPS);
  const [bpm, setBpm] = useState(savedTrack?.bpm ?? DEFAULT_BPM);
  const [mute, setMute] = useState(savedTrack?.mute ?? DEFAULT_MUTE);
  const [beatsPerBar, setBeatsPerBar] = useState(
    savedTrack?.beatsPerBar ?? DEFAULT_BEATS_PER_BAR
  );

  // Audio export hook - pass the audioContext from context
  const { connectRecorder, exportPattern, isExporting } =
    useAudioExport(audioContext);

  // Sample management hook
  const { uploadSample, loadSampleFromStorage } = useSampleManagement();

  const {
    instruments: instrumentConfig,
    setSteps: setTrackSteps,
    grid: instrumentGrid,
    setGrid,
    setVolumeAt,
    setMutedAt,
    deleteAt,
    addInstrument,
  } = useInstruments(DEFAULT_INSTRUMENTS, steps);

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
        const records = await listSamples();
        for (const rec of records) {
          const inst = await loadSampleFromStorage(
            rec.blob,
            rec.name,
            rec.id!,
            rec.volume,
            rec.muted
          );
          addInstrument(inst);
        }
      } catch (e) {
        console.warn("Failed to load persisted samples:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track persistence - auto-save and restore
  useTrackPersistence({
    instruments: instrumentConfig,
    grid: instrumentGrid,
    steps,
    bpm,
    beatsPerBar,
    mute,
    onRestoreGrid: setGrid,
    onRestoreVolume: setVolumeAt,
    onRestoreMuted: setMutedAt,
  });

  const handlePick = async (file: File) => {
    try {
      const newInstrument = await uploadSample(file);
      addInstrument(newInstrument);
    } catch (err) {
      console.error("Failed to load sample:", err);
    }
  };

  const handleExport = async () => {
    try {
      await ensureReady();
      if (!audioContext) return;

      const durationSeconds = calculatePatternDuration(steps, bpm, beatsPerBar);

      // Generate filename with timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      const filename = `${AUDIO_EXPORT_FILENAME_PREFIX}-${timestamp}.${AUDIO_EXPORT_FORMAT}`;

      await exportPattern(durationSeconds, filename);
    } catch (error) {
      console.error("Failed to export audio:", error);
    }
  };

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
