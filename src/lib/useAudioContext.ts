import { useEffect, useRef } from "react";

export function useAudioContext() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const ctx = new AudioContext();
    ctxRef.current = ctx;

    return () => {
      if (ctxRef.current && ctxRef.current.state !== "closed") {
        ctxRef.current.close().catch(() => {});
      }
      ctxRef.current = null;
    };
  }, []);

  const resume = async () => {
    if (ctxRef.current && ctxRef.current.state === "suspended") {
      try {
        await ctxRef.current.resume();
      } catch (e) {
        console.warn("Failed to resume AudioContext:", e);
      }
    }
  };

  return { ctxRef, resume } as const;
}
