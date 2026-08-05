import { describe, it, expect } from 'vitest';
import { calculatePatternDuration, calculateStepHz } from '../lib/utils/timing';
import bpmToHz from '../lib/utils/bpmToHz';

describe('calculatePatternDuration', () => {
  it('returns 2s for 16 steps, 120 BPM, 4 steps/beat', () => {
    expect(calculatePatternDuration(16, 120, 4)).toBe(2);
  });

  it('returns 8s for 32 steps, 60 BPM, 4 steps/beat', () => {
    expect(calculatePatternDuration(32, 60, 4)).toBe(8);
  });

  it('returns 0 for zero steps', () => {
    expect(calculatePatternDuration(0, 120, 4)).toBe(0);
  });

  it('doubling BPM halves duration', () => {
    const slow = calculatePatternDuration(16, 60, 4);
    const fast = calculatePatternDuration(16, 120, 4);
    expect(slow).toBeCloseTo(fast * 2, 5);
  });

  it('equals steps / calculateStepHz', () => {
    const steps = 16;
    const bpm = 140;
    const beatsPerBar = 3;
    const stepHz = calculateStepHz(bpm, steps, beatsPerBar);
    expect(calculatePatternDuration(steps, bpm, beatsPerBar)).toBe(steps / stepHz);
  });
});

describe('bpmToHz', () => {
  it('converts 120 BPM to 2 Hz', () => {
    const node: any = bpmToHz(120);
    expect(node.props.value).toBe(2);
  });

  it('converts 60 BPM to 1 Hz', () => {
    const node: any = bpmToHz(60);
    expect(node.props.value).toBe(1);
  });

  it('handles 0 BPM', () => {
    const node: any = bpmToHz(0);
    expect(node.props.value).toBe(0);
  });

  it('sets key to "bpm:hz"', () => {
    const node: any = bpmToHz(100);
    expect(node.props.key).toBe('bpm:hz');
  });
});
