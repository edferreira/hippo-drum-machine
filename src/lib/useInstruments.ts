import { useEffect, useState, useCallback, useMemo } from "react";
import type { Instrument } from "../types/audio";

const setupGrid = (rows: number, columns: number) => {
  return Array(rows)
    .fill(0)
    .map(() => Array(columns).fill(false));
};

export function useInstruments(
  initialInstruments: Instrument[],
  initialSteps: number
) {
  const [instruments, setInstruments] =
    useState<Instrument[]>(initialInstruments);
  const [steps, setSteps] = useState<number>(initialSteps);
  const [grid, setGrid] = useState<boolean[][]>(
    setupGrid(initialInstruments.length, initialSteps)
  );

  // Memoize instrument count to avoid unnecessary grid updates
  const instrumentCount = useMemo(
    () => instruments.length,
    [instruments.length]
  );

  // When steps change, resize columns while preserving existing pattern where possible
  // This effect optimizes grid operations by memoizing the grid transformation
  useEffect(() => {
    setGrid((prev) => {
      const rows = instrumentCount;
      const cols = steps;
      const next = setupGrid(rows, cols);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          next[r][c] = prev[r]?.[c] ?? false;
        }
      }
      return next;
    });
  }, [steps, instrumentCount]);

  const setVolumeAt = useCallback((idx: number, vol: number) => {
    setInstruments((prev) =>
      prev.map((inst, i) => (i === idx ? { ...inst, volume: vol } : inst))
    );
  }, []);

  const setMutedAt = useCallback((idx: number, muted: boolean) => {
    setInstruments((prev) =>
      prev.map((inst, i) => (i === idx ? { ...inst, muted } : inst))
    );
  }, []);

  const deleteAt = useCallback((idx: number) => {
    setInstruments((prev) => prev.filter((_, i) => i !== idx));
    setGrid((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const addInstrument = useCallback(
    (inst: Instrument) => {
      setInstruments((prev) => {
        const exists = prev.some(
          (p) => p.key === inst.key || (p.dbId != null && p.dbId === inst.dbId)
        );
        if (exists) return prev;
        return [...prev, inst];
      });
      setGrid((prev) => {
        const cols = prev[0]?.length ?? steps;
        return [...prev, Array(cols).fill(false)];
      });
    },
    [steps]
  );

  return {
    instruments,
    setInstruments,
    steps,
    setSteps,
    grid,
    setGrid,
    setVolumeAt,
    setMutedAt,
    deleteAt,
    addInstrument,
  } as const;
}
