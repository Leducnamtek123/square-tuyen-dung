import { getAppliedStatusTone } from '../applicationStatusPresentation';

describe('applied resume status presentation', () => {
  it('keeps hired and not selected visually distinct', () => {
    expect(getAppliedStatusTone(5)).toBe('success');
    expect(getAppliedStatusTone(6)).toBe('error');
  });

  it('maps intermediate application pipeline statuses to non-terminal tones', () => {
    expect(getAppliedStatusTone(1)).toBe('default');
    expect(getAppliedStatusTone(2)).toBe('info');
    expect(getAppliedStatusTone(3)).toBe('warning');
    expect(getAppliedStatusTone(4)).toBe('primary');
  });
});
