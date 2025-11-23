import { el, NodeRepr_t } from "@elemaudio/core";

/**
 * Clap synthesis via filtered white noise with layered envelopes
 *
 * Creates a clap sound by generating multiple layers of filtered white noise
 * with slightly offset envelopes to simulate the complexity of hand claps.
 *
 * @param tone - Bandpass filter cutoff frequency, tuned for [400Hz, 3500Hz]
 * @param attack - Attack time in seconds, tuned for [0s, 0.2s]
 * @param decay - Decay time in seconds, tuned for [0s, 4.0s]
 * @param gate - The pulse train which triggers the amp envelope
 * @returns Elementary Audio node for clap sound
 */
export default function clap(
  tone: NodeRepr_t | number,
  attack: NodeRepr_t | number,
  decay: NodeRepr_t | number,
  gate: NodeRepr_t
): NodeRepr_t {
  // Generate white noise source
  const no = el.noise();

  // Create four layered envelopes with slight timing offsets
  // This creates the characteristic "smeared" sound of multiple hands clapping
  const e1 = el.adsr(
    el.add(0.035, attack),
    el.add(0.06, decay),
    0.0,
    0.1,
    gate
  );
  const e2 = el.adsr(
    el.add(0.025, attack),
    el.add(0.05, decay),
    0.0,
    0.1,
    gate
  );
  const e3 = el.adsr(
    el.add(0.015, attack),
    el.add(0.04, decay),
    0.0,
    0.1,
    gate
  );
  const e4 = el.adsr(
    el.add(0.005, attack),
    el.add(0.02, decay),
    0.0,
    0.1,
    gate
  );

  // Mix the four noise layers with their respective envelopes
  // Apply bandpass filter (400Hz-3500Hz) and soft saturation
  return el.tanh(
    el.bandpass(
      tone,
      1.214,
      el.add(el.mul(no, e1), el.mul(no, e2), el.mul(no, e3), el.mul(no, e4))
    )
  );
}
