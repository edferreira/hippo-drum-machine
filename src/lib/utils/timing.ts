/**
 * Audio timing utility functions for sequencer calculations
 */

/**
 * Calculate step frequency (Hz) from BPM and pattern configuration
 *
 * @param bpm - Beats per minute
 * @param steps - Total number of steps in pattern
 * @param beatsPerBar - Number of beats per bar (typically 4)
 * @returns Frequency in Hz for each step
 *
 * @example
 * // 120 BPM, 16 steps, 4 beats per bar = 8 Hz
 * calculateStepHz(120, 16, 4) // 8
 */
export function calculateStepHz(
  bpm: number,
  steps: number,
  beatsPerBar: number
): number {
  return (bpm / 60) * (steps / beatsPerBar);
}

/**
 * Calculate pattern duration in seconds
 *
 * @param steps - Total number of steps in pattern
 * @param bpm - Beats per minute
 * @param beatsPerBar - Number of beats per bar (typically 4)
 * @returns Duration in seconds for one complete pattern cycle
 *
 * @example
 * // 16 steps, 120 BPM, 4 beats per bar = 2 seconds
 * calculatePatternDuration(16, 120, 4) // 2
 */
export function calculatePatternDuration(
  steps: number,
  bpm: number,
  beatsPerBar: number
): number {
  const stepHz = calculateStepHz(bpm, steps, beatsPerBar);
  return steps / stepHz;
}
