import { el } from "@elemaudio/core";
import { useCallback, useEffect } from "react";
import { core } from "./webRenderer";
import type { Instrument } from "../types/audio";

type UseSynthProps = {
  steps: number[][];
  instruments: Instrument[];
  bpm?: number;
  volume?: number;
  mute?: boolean;
  beatsPerBar?: number;
};

export const useSequencer = ({
  steps,
  instruments,
  bpm = 120,
  volume = 1,
  mute = false,
  beatsPerBar = 4,
}: UseSynthProps) => {
  const render = useCallback(async () => {
    try {
      const stepsPerPattern = steps[0]?.length ?? 0;
      const allRowsMatch = steps.every(
        (row) => (row?.length ?? 0) === stepsPerPattern
      );
      if (!allRowsMatch || stepsPerPattern <= 0) {
        if (core) {
          await core.render(el.const({ value: 0 }), el.const({ value: 0 }));
        }
        return;
      }

      if (!instruments || instruments.length === 0) {
        if (core) {
          await core.render(el.const({ value: 0 }), el.const({ value: 0 }));
        }
        return;
      }

      // Clock
      const stepsPerBeat = beatsPerBar;
      const beatsPerSecond = bpm / 60;
      const stepHz = beatsPerSecond * stepsPerBeat;
      const tick = el.train(
        el.const({ key: "tick:hz", value: stepHz })
      );

      // Sync pulse once per pattern (keyed so pattern-length changes don't reset position)
      const sync = el.seq2(
        {
          key: "sync",
          seq: [1, ...Array(Math.max(0, stepsPerPattern - 1)).fill(0)],
          hold: true,
        },
        tick,
        0
      );

      // Build sequences for each instrument. Keyed so toggling a cell
      // updates the seq data in place without resetting position.
      const seqs = instruments.map((inst, i) =>
        el.seq({ key: `seq:${i}`, seq: steps[i] }, tick, sync)
      );

      // Create audio nodes for each instrument
      const nodes = instruments.map((inst, i) =>
        inst.makeNode
          ? el.mul(
              inst.muted ? 0 : inst.volume ?? 1,
              inst.makeNode(seqs[i])
            )
          : el.const({ value: 0 })
      );

      const mixed =
        nodes.length > 0 ? el.add(...nodes) : el.const({ value: 0 });

      let left = mixed;
      let right = mixed;

      // Playhead phasor for visual position
      const playheadPhasor = el.syncphasor(
        el.const({ key: "phasor:hz", value: stepHz }),
        sync
      );
      const playheadSnapshot = el.snapshot(
        { name: "snapshot:patternpos" },
        tick,
        playheadPhasor
      );
      left = el.add(left, el.mul(0, playheadSnapshot));

      // Fade-in envelope: gates audio for first few ms after render
      // to mask transient from graph rebuild
      const fade = el.adsr(0.005, 0, 1, 0, el.const({ value: 1 }));

      // Master gain (volume * mute gate; 0.0001 keeps graph alive)
      const masterGain = mute ? 0.0001 : volume;
      left = el.mul(el.const({ value: masterGain }), left);
      left = el.mul(fade, left);
      right = el.mul(el.const({ value: masterGain }), right);
      right = el.mul(fade, right);

      if (core) {
        await core.render(left, right);
      }
    } catch (error) {
      console.error("Error in useSynth render:", error);
    }
  }, [steps, instruments, bpm, volume, mute, beatsPerBar]);

  // Render whenever dependencies change (including step edits)
  useEffect(() => {
    render();

    return () => {
      try {
        const silence = el.const({ value: 0 });
        if (core) {
          core
            .render(silence, silence)
            .catch((err: any) =>
              console.error("Error silencing output:", err)
            );
        }
      } catch (error) {
        console.error("Error in useSynth cleanup:", error);
      }
    };
  }, [render]);

  const restart = useCallback(() => {
    core.reset();
  }, []);

  return { render, restart } as const;
};

export default useSequencer;
