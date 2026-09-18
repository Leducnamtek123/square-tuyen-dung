import { formatSecondsToTime } from '../useInterviewQuestionHUD';

describe('useInterviewQuestionHUD utils', () => {
  describe('formatSecondsToTime', () => {
    it('formats 120 seconds to 02:00', () => {
      expect(formatSecondsToTime(120)).toBe('02:00');
    });

    it('formats 75 seconds to 01:15', () => {
      expect(formatSecondsToTime(75)).toBe('01:15');
    });

    it('formats 9 seconds to 00:09', () => {
      expect(formatSecondsToTime(9)).toBe('00:09');
    });

    it('formats 0 seconds to 00:00', () => {
      expect(formatSecondsToTime(0)).toBe('00:00');
    });

    it('handles negative values gracefully as 00:00', () => {
      expect(formatSecondsToTime(-10)).toBe('00:00');
    });
  });
});
