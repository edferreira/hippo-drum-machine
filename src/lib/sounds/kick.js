import { el } from "@elemaudio/core";

export const kick = (
  freqs,
  trigs,
  id,
  { freq = 42, speed = 1.0, pop = 1.0, tail = 1.0, gain = 1.0 }
) => {
  let fastEnv = el.adsr(0.0001, 0.2 * speed, 0.0, 0.0, trigs);
  let slowEnv = el.adsr(0.0001, 0.5, 0.0, 0.0, trigs);

  let pitchEnv = el.add(1.0, el.mul(3 * pop, fastEnv));
  pitchEnv = el.add(0.0, el.mul(0.5 * pop, slowEnv), pitchEnv);

  let out = el.cycle(el.mul(pitchEnv, freq));

  let ampEnv = el.adsr(0.03, 0.23 * speed, 0.3, 0.2, trigs);
  out = el.mul(ampEnv, out);

  let snapEnv = el.adsr(0.001, 0.01, 0.0, 0.0, trigs);
  let snap = el.cycle(el.mul(snapEnv, 3000));
  let snapFltEnv = el.adsr(0.005, 0.1, 0, 0, trigs);
  snap = el.lowpass(el.add(110, el.mul(1100, snapFltEnv)), 1, snap);
  out = el.add(el.mul(0.4, snap), out);

  out = el.highpass(freq + 14, tail * 2.0, out);

  out = el.mul(gain, out);

  return out;
};
