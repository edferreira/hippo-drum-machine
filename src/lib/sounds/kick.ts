import { el, NodeRepr_t } from "@elemaudio/core";

interface KickOptions {
  freq?: number;
  speed?: number;
  pop?: number;
  tail?: number;
  gain?: number;
}

/**
 * Kick drum synthesis using frequency envelopes and harmonics
 *
 * @param freqs - Frequency modulation input (typically unused, kept for compatibility)
 * @param trigs - Trigger signal for envelope gates
 * @param id - Unique identifier for the kick instance
 * @param options - Synthesis parameters
 * @returns Elementary Audio node for kick drum sound
 */
export const kick = (
  freqs: NodeRepr_t | number,
  trigs: NodeRepr_t,
  id: string,
  {
    freq = 42,
    speed = 1.0,
    pop = 1.0,
    tail = 1.0,
    gain = 1.0,
  }: KickOptions = {}
): NodeRepr_t => {
  // Fast envelope for initial pitch modulation
  const fastEnv = el.adsr(0.0001, 0.2 * speed, 0.0, 0.0, trigs);
  // Slower envelope for extended pitch bend
  const slowEnv = el.adsr(0.0001, 0.5, 0.0, 0.0, trigs);

  // Combine envelopes for pitch modulation
  let pitchEnv = el.add(1.0, el.mul(3 * pop, fastEnv));
  pitchEnv = el.add(0.0, el.mul(0.5 * pop, slowEnv), pitchEnv);

  // Generate base oscillator with pitch envelope
  let out = el.cycle(el.mul(pitchEnv, freq));

  // Apply amplitude envelope
  const ampEnv = el.adsr(0.03, 0.23 * speed, 0.3, 0.2, trigs);
  out = el.mul(ampEnv, out);

  // Add snap/click component for attack transient
  const snapEnv = el.adsr(0.001, 0.01, 0.0, 0.0, trigs);
  let snap = el.cycle(el.mul(snapEnv, 3000));
  const snapFltEnv = el.adsr(0.005, 0.1, 0, 0, trigs);
  snap = el.lowpass(el.add(110, el.mul(1100, snapFltEnv)), 1, snap);
  out = el.add(el.mul(0.4, snap), out);

  // High-pass filter to shape the tail
  out = el.highpass(freq + 14, tail * 2.0, out);

  // Apply master gain
  out = el.mul(gain, out);

  return out;
};
