import { shouldResetChildLocationValue } from '../locationForm';

describe('shouldResetChildLocationValue', () => {
  it('does not reset child field on initial load', () => {
    expect(shouldResetChildLocationValue(null, 1)).toBe(false);
    expect(shouldResetChildLocationValue(undefined, 1)).toBe(false);
  });

  it('resets child field when parent changes or is cleared', () => {
    expect(shouldResetChildLocationValue(1, 2)).toBe(true);
    expect(shouldResetChildLocationValue(1, '')).toBe(true);
    expect(shouldResetChildLocationValue(1, null)).toBe(true);
  });

  it('keeps child field when parent id is unchanged across string and number forms', () => {
    expect(shouldResetChildLocationValue(1, '1')).toBe(false);
  });
});
