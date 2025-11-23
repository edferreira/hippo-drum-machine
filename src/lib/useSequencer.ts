import { el } from "@elemaudio/core";
import { useCallback, useEffect } from "react";
import { core } from "./webRenderer";
import type { Instrument } from "../types/audio";

type UseSynthProps = {
  steps: number[][];
  instruments: Instrument[];
  bpm?: number;
  mute?: boolean;
  beatsPerBar?: number;
};

export const useSequencer = ({
  steps,
  instruments,
  bpm = 120,
  mute = false,
  beatsPerBar = 4,
}: UseSynthProps) => {
  const render = useCallback(async () => {
    try {
      // Ensure audio context is resumed and renderer is initialized
      // await resume();

      // Handle case with no instruments
      if (!instruments || instruments.length === 0) {
        const silence = el.const({ value: 0 });
        if (core) {
          await core.render(silence, silence);
        }
        return;
      }

      // Determine pattern length (columns) and convert BPM to per-step rate
      const stepsPerPattern = steps[0]?.length ?? 0;
      if (stepsPerPattern <= 0) {
        const silence = el.const({ value: 0 });
        if (core) {
          await core.render(silence, silence);
        }
        return;
      }

      // Calculate step frequency
      // NOTE: beatsPerBar is misleadingly named - it actually means "stepsPerBeat"
      // (how many steps equal one quarter note beat)
      //
      // Formula: stepHz = (beats per second) * (steps per beat)
      // Example: 120 BPM, 4 steps per beat (16th notes)
      //   → 2 beats/sec * 4 steps/beat = 8 steps/sec
      const stepsPerBeat = beatsPerBar;
      const beatsPerSecond = bpm / 60;
      const stepHz = beatsPerSecond * stepsPerBeat;
      const tick = el.train(el.const({ key: "tick:hz", value: stepHz }));

      // Sync pulse once per pattern (first step high, others 0)
      const sync = el.seq2(
        {
          seq: [1, ...Array(Math.max(0, stepsPerPattern - 1)).fill(0)],
          hold: true,
        },
        tick,
        0
      );

      // Build sequences for each instrument, resetting with the same sync used by the visual phasor
      const seqs = instruments.map((inst, i) =>
        el.seq({ seq: steps[i] }, tick, sync)
      );

      // Create audio nodes for each instrument
      const nodes = instruments.map((inst, i) =>
        inst.makeNode
          ? el.mul(inst.muted ? 0 : inst.volume ?? 1, inst.makeNode(seqs[i]))
          : el.const({ value: 0 })
      );

      // Mix all instrument nodes together (handle empty nodes array)
      const mixed =
        nodes.length > 0 ? el.add(...nodes) : el.const({ value: 0 });

      // Create stereo channels
      let left = mixed;
      let right = mixed;

      // Continuous playhead phasor in range [0,1), useful for external display.
      const playheadPhasor = el.syncphasor(
        el.const({ key: "phasor:hz", value: stepHz }),
        sync
      );

      // Emit the phasor as snapshot events (same behavior as original: fractional 0..1)
      const playheadSnapshot = el.snapshot(
        { name: "snapshot:patternpos" },
        tick,
        playheadPhasor
      );

      left = el.add(left, el.mul(0, playheadSnapshot));

      // left = el.metro({ key: 'step', name: 'stepIndicator', interval: 200 });

      // Apply master gain (respect mute flag)
      const masterGain = mute ? 0.0001 : 1;
      left = el.mul(el.const({ value: masterGain }), left);
      right = el.mul(el.const({ value: masterGain }), right);

      // Render stereo output
      if (core) {
        await core.render(left, right);
      }
    } catch (error) {
      console.error("Error in useSynth render:", error);
    }
  }, [steps, instruments, bpm, mute]);

  // Run render on mount and when dependencies change
  useEffect(() => {
    render();

    // Cleanup function
    return () => {
      try {
        const silence = el.const({ value: 0 });
        if (core) {
          core
            .render(silence, silence)
            .catch((err: any) => console.error("Error silencing output:", err));
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
