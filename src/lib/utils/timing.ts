/**
 * Audio timing utility functions for sequencer calculations
 *
 * Pattern timing model:
 * - stepsPerBeat parameter defines step resolution (e.g., 4 = 16th notes, 2 = 8th notes)
 * - For 16 steps with stepsPerBeat=4: 16 steps ÷ 4 steps/beat = 4 beats = 1 bar in 4/4 time
 * - For 16 steps with stepsPerBeat=2: 16 steps ÷ 2 steps/beat = 8 beats = 2 bars in 4/4 time
 *
 * IMPORTANT: The parameter is named 'beatsPerBar' for historical reasons but actually represents
 * 'stepsPerBeat' (how many steps equal one beat/quarter note). This should ideally be renamed.
 */

/**
 * Calculate step frequency (Hz) from BPM and pattern configuration
 *
 * @param bpm - Beats per minute (quarter notes per minute)
 * @param steps - Total number of steps in pattern
 * @param beatsPerBar - Actually 'stepsPerBeat': how many steps equal one quarter note
 *                      (4 = 16th notes, 2 = 8th notes, 8 = 32nd notes)
 * @returns Frequency in Hz for each step
 *
 * @example
 * // 120 BPM, 16 steps, 4 steps per beat (16th notes) = 8 Hz
 * // 16 steps ÷ 4 steps/beat = 4 beats = 1 bar at 4/4
 * // 120 BPM = 2 beats/second, so 2 * 4 = 8 steps/second
 * calculateStepHz(120, 16, 4) // 8
 *
 * @example
 * // 120 BPM, 16 steps, 2 steps per beat (8th notes) = 4 Hz
 * // 16 steps ÷ 2 steps/beat = 8 beats = 2 bars at 4/4
 * // 120 BPM = 2 beats/second, so 2 * 2 = 4 steps/second
 * calculateStepHz(120, 16, 2) // 4
 */
export function calculateStepHz(
  bpm: number,
  steps: number,
  beatsPerBar: number // Actually stepsPerBeat - parameter name is misleading
): number {
  const beatsPerSecond = bpm / 60;
  const stepsPerBeat = beatsPerBar; // This is what the parameter actually represents

  // stepHz = (beats per second) * (steps per beat)
  return beatsPerSecond * stepsPerBeat;
}
/**
 * Calculate pattern duration in seconds
 *
 * @param steps - Total number of steps in pattern
 * @param bpm - Beats per minute
 * @param beatsPerBar - Actually 'stepsPerBeat': how many steps equal one quarter note
 * @returns Duration in seconds for one complete pattern cycle
 *
 * @example
 * // 16 steps, 120 BPM, 4 steps per beat (16th notes) = 2 seconds
 * // 16 steps ÷ 4 steps/beat = 4 beats
 * // 4 beats ÷ 2 beats/second = 2 seconds
 * calculatePatternDuration(16, 120, 4) // 2
 *
 * @example
 * // 16 steps, 120 BPM, 2 steps per beat (8th notes) = 4 seconds
 * // 16 steps ÷ 2 steps/beat = 8 beats
 * // 8 beats ÷ 2 beats/second = 4 seconds
 * calculatePatternDuration(16, 120, 2) // 4
 */
export function calculatePatternDuration(
  steps: number,
  bpm: number,
  beatsPerBar: number // Actually stepsPerBeat - parameter name is misleading
): number {
  const stepHz = calculateStepHz(bpm, steps, beatsPerBar);
  return steps / stepHz;
}
