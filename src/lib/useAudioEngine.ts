import { useEffect, useMemo, useRef, useState } from "react";
import { useAudioContext } from "./useAudioContext";
import { useWebRenderer } from "./useWebRenderer";

export function useAudioEngine() {
  const { ctxRef, resume } = useAudioContext();
  const { initRenderer } = useWebRenderer(ctxRef);
  const [ready, setReady] = useState(false);
  const initializingRef = useRef<Promise<void> | null>(null);

  const ensureReady = useMemo(() => {
    return async () => {
      if (ready) return;
      if (initializingRef.current) return initializingRef.current;
      initializingRef.current = (async () => {
        if (!ctxRef.current) return;
        await resume();
        await initRenderer();
        setReady(true);
      })().finally(() => {
        initializingRef.current = null;
      });
      return initializingRef.current;
    };
  }, [ready, resume, initRenderer, ctxRef]);

  useEffect(() => {
    (async () => {
      if (ctxRef.current) {
        try {
          await ensureReady();
        } catch (e) {
          console.warn("Audio engine init failed:", e);
        }
      }
    })();
  }, [ctxRef.current]);

  return {
    ctxRef,
    ready,
    ensureReady,
  } as const;
}
