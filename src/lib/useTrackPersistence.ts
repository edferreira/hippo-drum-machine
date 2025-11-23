import { useEffect, useRef } from "react";
import type { Instrument, PersistedTrack } from "../types/audio";
import {
  loadTrack,
  buildGridFromPersisted,
  saveTrack,
  serializeInstruments,
} from "./storage/trackStorage";

interface UseTrackPersistenceOptions {
  instruments: Instrument[];
  grid: boolean[][];
  steps: number;
  bpm: number;
  beatsPerBar: number;
  mute: boolean;
  onRestoreGrid: (grid: boolean[][]) => void;
  onRestoreVolume: (idx: number, volume: number) => void;
  onRestoreMuted: (idx: number, muted: boolean) => void;
}

/**
 * Hook for managing track persistence (save/restore from localStorage)
 * Handles grid restoration and instrument property restoration on mount
 */
export function useTrackPersistence({
  instruments,
  grid,
  steps,
  bpm,
  beatsPerBar,
  mute,
  onRestoreGrid,
  onRestoreVolume,
  onRestoreMuted,
}: UseTrackPersistenceOptions) {
  const savedTrack = useRef<PersistedTrack | null>(null);
  const hasRestoredRef = useRef(false);

  // Load saved track on mount
  useEffect(() => {
    savedTrack.current = loadTrack();
  }, []);

  // Restore grid and instrument properties when instruments are loaded
  useEffect(() => {
    const track = savedTrack.current;
    if (!track || hasRestoredRef.current) return;
    if (instruments.length === 0) return;

    // Check if all required samples are loaded
    const wantedSampleIds = new Set(
      track.instruments
        .filter((p) => p.kind === "sample" && p.dbId != null)
        .map((p) => p.dbId as number)
    );
    const presentSampleIds = new Set(
      instruments.filter((i) => i.dbId != null).map((i) => i.dbId as number)
    );

    const hasMissingSamples = Array.from(wantedSampleIds).some(
      (id) => !presentSampleIds.has(id)
    );
    if (hasMissingSamples && wantedSampleIds.size > 0) {
      return;
    }

    // Restore grid pattern
    const restoredGrid = buildGridFromPersisted(instruments, track);
    onRestoreGrid(restoredGrid);

    // Restore volume and mute state for built-in instruments
    instruments.forEach((inst, idx) => {
      const match = track.instruments.find((p) =>
        inst.dbId != null
          ? p.kind === "sample" && p.dbId === inst.dbId
          : p.kind === "builtin" && p.key === inst.key
      );
      if (!match) return;

      // Only restore volume/mute for built-in instruments
      // Sample instruments get their state from IndexedDB
      if (inst.dbId == null) {
        if (typeof match.volume === "number" && match.volume !== inst.volume) {
          onRestoreVolume(idx, match.volume);
        }
        if (typeof match.muted === "boolean" && match.muted !== inst.muted) {
          onRestoreMuted(idx, match.muted);
        }
      }
    });

    hasRestoredRef.current = true;
  }, [instruments, onRestoreGrid, onRestoreVolume, onRestoreMuted]);

  // Auto-save track state when it changes
  useEffect(() => {
    if (!hasRestoredRef.current) return;

    try {
      const instrumentsData = serializeInstruments(instruments, grid, steps);
      const payload: PersistedTrack = {
        version: 1,
        steps,
        bpm,
        beatsPerBar,
        mute,
        instruments: instrumentsData,
        savedAt: Date.now(),
      };
      saveTrack(payload);
    } catch (error) {
      console.warn("Failed to save track:", error);
    }
  }, [instruments, grid, steps, bpm, beatsPerBar, mute]);

  return {
    hasRestored: hasRestoredRef.current,
  };
}
