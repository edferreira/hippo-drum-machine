import { describe, it, expect } from 'vitest';
import { DEFAULT_BPM, DEFAULT_STEPS, DEFAULT_BEATS_PER_BAR, DEFAULT_MUTE } from '../lib/constants';

describe('constants', () => {
  it('DEFAULT_BPM should be 120', () => {
    expect(DEFAULT_BPM).toBe(120);
  });

  it('DEFAULT_STEPS should be 16', () => {
    expect(DEFAULT_STEPS).toBe(16);
  });

  it('DEFAULT_BEATS_PER_BAR should be 4', () => {
    expect(DEFAULT_BEATS_PER_BAR).toBe(4);
  });

  it('DEFAULT_MUTE should be false', () => {
    expect(DEFAULT_MUTE).toBe(false);
  });
});
