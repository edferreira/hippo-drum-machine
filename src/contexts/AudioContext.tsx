import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { core, initRenderer } from "../lib/webRenderer";
import type { AudioContextValue, AudioContextState } from "../types/audio";

const AudioContext = createContext<AudioContextValue | null>(null);

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
}

interface AudioProviderProps {
  children: ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [state, setState] = useState<AudioContextState>({
    audioContext: null,
    isReady: false,
    error: null,
  });
  const initializingRef = useRef<Promise<void> | null>(null);

  const initialize = useCallback(async () => {
    if (initializingRef.current) {
      return initializingRef.current;
    }

    initializingRef.current = (async () => {
      try {
        // Create AudioContext if needed
        if (!audioContextRef.current) {
          audioContextRef.current = new window.AudioContext();
        }

        const ctx = audioContextRef.current;

        // Resume if suspended
        if (ctx.state === "suspended") {
          await ctx.resume();
        }

        // Initialize Elementary Audio renderer
        await initRenderer(ctx);

        setState({
          audioContext: ctx,
          isReady: true,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to initialize audio";
        setState((prev) => ({
          ...prev,
          error: message,
        }));
        throw error;
      } finally {
        initializingRef.current = null;
      }
    })();

    return initializingRef.current;
  }, []);

  const ensureReady = useCallback(async () => {
    if (state.isReady) return;
    await initialize();
  }, [state.isReady, initialize]);

  const value: AudioContextValue = {
    ...state,
    initialize,
    ensureReady,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}
