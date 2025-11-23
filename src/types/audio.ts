// Shared type definitions for audio-related functionality

export interface Instrument {
  key: string;
  name: string;
  seqOptions?: any;
  volume?: number;
  muted?: boolean;
  dbId?: number | string;
  makeNode: (seq: any) => any;
}

export interface AudioContextState {
  audioContext: AudioContext | null;
  isReady: boolean;
  error: string | null;
}

export interface AudioContextValue extends AudioContextState {
  ensureReady: () => Promise<void>;
  initialize: () => Promise<void>;
}

export interface LoadedSample {
  vfsKey: string;
  name: string;
}

export interface PersistedInstrument {
  kind: "builtin" | "sample";
  key?: string; // for builtin instruments (e.g., "clap", "hat", "kick")
  dbId?: number; // for sample instruments, key to IndexedDB record
  volume?: number;
  muted?: boolean;
  pattern: boolean[]; // length === steps
}

export interface PersistedTrack {
  version: 1;
  steps: number;
  bpm: number;
  beatsPerBar: number;
  mute: boolean;
  instruments: PersistedInstrument[];
  savedAt: number;
}
