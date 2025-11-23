import { useCallback } from "react";
import { el } from "@elemaudio/core";
import { useAudio } from "../contexts/AudioContext";
import type { Instrument } from "../types/audio";
import { loadSampleFromFile, loadSampleFromBlob } from "./audioSampleLoader";
import { addSample } from "./storage/samplesDB";

/**
 * Hook for managing sample uploads and creating sample-based instruments
 */
export function useSampleManagement() {
  const { audioContext, ensureReady } = useAudio();

  /**
   * Handle file upload and create a new sample instrument
   */
  const uploadSample = useCallback(
    async (file: File): Promise<Instrument> => {
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

      // Persist the uploaded sample to IndexedDB
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

      return newInstrument;
    },
    [audioContext, ensureReady]
  );

  /**
   * Load a sample from a Blob (used for restoring from IndexedDB)
   */
  const loadSampleFromStorage = useCallback(
    async (
      blob: Blob,
      name: string,
      dbId: number,
      volume: number,
      muted: boolean
    ): Promise<Instrument> => {
      await ensureReady();
      if (!audioContext) throw new Error("AudioContext not ready");

      const { vfsKey } = await loadSampleFromBlob(audioContext, blob, name);

      return {
        key: vfsKey,
        name,
        volume,
        muted,
        dbId,
        makeNode: (seq: any) => el.sample({ path: vfsKey }, seq, 1),
      };
    },
    [audioContext, ensureReady]
  );

  return {
    uploadSample,
    loadSampleFromStorage,
  };
}
