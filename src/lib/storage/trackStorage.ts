// Local storage persistence for the last opened track
// Keeps transport and pattern data so the app can restore on reload

import type {
  Instrument,
  PersistedInstrument,
  PersistedTrack,
} from "../../types/audio";

const STORAGE_KEY = "hippo:lastTrack";

export function saveTrack(state: PersistedTrack): void {
  try {
    const payload = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, payload);
  } catch (e) {
    // Ignore quota or serialization errors silently
    // eslint-disable-next-line no-console
    console.warn("Failed to save track:", e);
  }
}

export function loadTrack(): PersistedTrack | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedTrack;
    if (parsed && parsed.version === 1) return parsed;
    return null;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("Failed to load track:", e);
    return null;
  }
}

export function serializeInstruments(
  instruments: Instrument[],
  grid: boolean[][],
  steps: number
): PersistedInstrument[] {
  return instruments.map((inst, i) => {
    const isSample = inst.dbId != null;
    const base: PersistedInstrument = {
      kind: isSample ? "sample" : "builtin",
      key: isSample ? undefined : inst.key,
      dbId: isSample ? (inst.dbId as number) : undefined,
      volume: inst.volume,
      muted: inst.muted,
      pattern: (grid[i] ?? Array(steps).fill(false)).slice(0, steps),
    };
    if (!isSample) delete (base as any).dbId;
    if (isSample) delete (base as any).key;
    return base;
  });
}

export function buildGridFromPersisted(
  instruments: Instrument[],
  persisted: PersistedTrack
): boolean[][] {
  const cols = persisted.steps;
  const emptyRow = () => Array(cols).fill(false) as boolean[];

  const findPattern = (inst: Instrument): boolean[] => {
    const match = persisted.instruments.find((p) => {
      if (inst.dbId != null) {
        return p.kind === "sample" && p.dbId === inst.dbId;
      }
      return p.kind === "builtin" && p.key === inst.key;
    });
    const pat = match?.pattern ?? emptyRow();
    // normalize length
    if (pat.length === cols) return pat;
    if (pat.length > cols) return pat.slice(0, cols);
    return [...pat, ...Array(cols - pat.length).fill(false)];
  };

  return instruments.map((inst) => findPattern(inst));
}
