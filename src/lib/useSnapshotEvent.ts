import { useCallback, useEffect, useState } from "react";
import { core } from "./webRenderer";

/**
 * Hook to listen for snapshot events from Elementary Audio renderer
 *
 * @param eventName - The snapshot event name to listen for (e.g., "snapshot:patternpos")
 * @param onSnapshot - Callback function when snapshot event occurs
 *
 * @example
 * // Track playback position
 * const position = useSnapshotEvent("snapshot:patternpos", (data) => {
 *   console.log("Current position:", data);
 * });
 */
export function useSnapshotEvent(
  eventName: string,
  onSnapshot?: (data: number) => void
) {
  const [value, setValue] = useState<number | null>(null);

  const handleSnapshot = useCallback(
    (e: { source?: string; data: number }) => {
      if (e?.source === eventName) {
        setValue(e.data);
        onSnapshot?.(e.data);
      }
    },
    [eventName, onSnapshot]
  );

  useEffect(() => {
    core.on("snapshot", handleSnapshot);

    return () => {
      core.off("snapshot", handleSnapshot);
    };
  }, [handleSnapshot]);

  return value;
}

/**
 * Hook to track the current playback step position
 * Returns the current step index (0-based)
 *
 * @example
 * const currentStep = useCurrentStep();
 * // Returns 0-15 for a 16-step pattern
 */
export function useCurrentStep() {
  const [pos, setPos] = useState(-1);

  useSnapshotEvent("snapshot:patternpos", (data) => {
    // When pattern loops back to start (data === 0), reset to 0
    // Otherwise increment from previous position
    setPos((prevPos) => (data === 0 ? 0 : prevPos + 1));
  });

  return pos;
}
