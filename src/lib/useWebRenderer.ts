import { useRef } from "react";
import {
  core as exportedCore,
  initRenderer as initExportedRenderer,
} from "../lib/webRenderer";

export function useWebRenderer(ctxRef: React.RefObject<AudioContext | null>) {
  const coreRef = useRef<any>(null);
  const nodeInitRef = useRef<Promise<any> | null>(null);

  /**
   * Initialize the shared WebRenderer (the one exported from lib/webRenderer).
   * This ensures other modules that import `core` (like useSynth) will
   * operate on the same renderer instance.
   */
  const initRenderer = async () => {
    const ctx = ctxRef.current;
    if (!ctx) throw new Error("AudioContext not available for renderer init");

    // Use the exported core instance so imports elsewhere refer to the
    // same renderer object.
    if (!coreRef.current) coreRef.current = exportedCore;

    if (nodeInitRef.current) return nodeInitRef.current;

    nodeInitRef.current = initExportedRenderer(ctx)
      .then((node: any) => node)
      .catch((err: any) => {
        console.error("WebRenderer initialization failed:", err);
        nodeInitRef.current = null;
        throw err;
      });

    return nodeInitRef.current;
  };

  const dispose = () => {
    coreRef.current = null;
    nodeInitRef.current = null;
  };

  return { coreRef, nodeInitRef, initRenderer, dispose } as const;
}
