import { el, NodeRepr_t } from "@elemaudio/core";

/**
 * Helper function for a sine wave oscillator with a phase offset
 * Used for phase modulation synthesis
 */
function cycle(
  freq: NodeRepr_t | number,
  phaseOffset: NodeRepr_t | number
): NodeRepr_t {
  const t = el.add(el.phasor(freq), phaseOffset);
  const p = el.sub(t, el.floor(t));

  return el.sin(el.mul(2 * Math.PI, p));
}

/**
 * Hi-hat drum synthesis via phase modulation
 *
 * Creates metallic hi-hat sounds through cascaded phase modulation.
 * A carrier sine wave is modulated by another sine at twice its frequency,
 * which is in turn modulated by white noise. This creates the characteristic
 * bright, metallic timbre of hi-hats.
 *
 * Tuning inspired by the Roland DR-110 drum machine.
 *
 * @param pitch - Base frequency in the range [317Hz, 3170Hz]
 * @param tone - Bandpass filter cutoff frequency, tuned for [800Hz, 18kHz]
 * @param attack - Attack time in seconds, tuned for [0.005s, 0.2s]
 * @param decay - Decay time in seconds, tuned for [0.005s, 4.0s]
 * @param gate - The pulse train which triggers the amp envelope
 * @returns Elementary Audio node for hi-hat sound
 */
export default function hat(
  pitch: NodeRepr_t | number,
  tone: NodeRepr_t | number,
  attack: NodeRepr_t | number,
  decay: NodeRepr_t | number,
  gate: NodeRepr_t
): NodeRepr_t {
  // Three-stage phase modulation synthesis
  // m2: White noise modulator (top of the chain)
  const m2 = el.noise();
  // m1: Sine at 2x carrier frequency, modulated by noise
  const m1 = cycle(el.mul(2, pitch), el.mul(2, m2));
  // m0: Carrier sine at base frequency, modulated by m1
  const m0 = cycle(pitch, el.mul(2, m1));

  // Bandpass filter to shape the tone (800Hz - 18kHz range)
  const f = el.bandpass(tone, 1.214, m0);

  // Amplitude envelope with configurable attack [5ms-200ms] and decay [5ms-4000ms]
  const env = el.adsr(attack, decay, 0.0, 0.1, gate);

  return el.mul(f, env);
}
