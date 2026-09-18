/**
 * Unit tests for InterviewRecordingBadge logic and timer formatting
 */

export const formatRecordingTime = (totalSec: number) => {
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
};

export const computeElapsedSeconds = (startTime?: Date | string | number, currentTime: number = Date.now()) => {
  if (!startTime) return 0;
  const start = new Date(startTime).getTime();
  return Math.max(0, Math.floor((currentTime - start) / 1000));
};

describe('InterviewRecordingBadge Logic', () => {
  describe('formatRecordingTime', () => {
    it('formats initial 0 seconds as 00:00', () => {
      expect(formatRecordingTime(0)).toBe('00:00');
    });

    it('formats under 1 minute correctly', () => {
      expect(formatRecordingTime(3)).toBe('00:03');
      expect(formatRecordingTime(45)).toBe('00:45');
      expect(formatRecordingTime(59)).toBe('00:59');
    });

    it('formats exact minutes and seconds correctly (e.g. 02:00 from user reference)', () => {
      expect(formatRecordingTime(60)).toBe('01:00');
      expect(formatRecordingTime(63)).toBe('01:03');
      expect(formatRecordingTime(120)).toBe('02:00');
      expect(formatRecordingTime(599)).toBe('09:59');
      expect(formatRecordingTime(600)).toBe('10:00');
      expect(formatRecordingTime(1800)).toBe('30:00');
    });

    it('formats hours when elapsed exceeds 1 hour', () => {
      expect(formatRecordingTime(3600)).toBe('01:00:00');
      expect(formatRecordingTime(3665)).toBe('01:01:05');
      expect(formatRecordingTime(7325)).toBe('02:02:05');
    });
  });

  describe('computeElapsedSeconds', () => {
    it('returns 0 when startTime is undefined', () => {
      expect(computeElapsedSeconds(undefined)).toBe(0);
    });

    it('computes elapsed seconds correctly from past start time', () => {
      const now = 1789070000000;
      const start = new Date(now - 120000); // 2 minutes ago
      expect(computeElapsedSeconds(start, now)).toBe(120);
    });

    it('handles future start time gracefully by returning 0', () => {
      const now = 1789070000000;
      const future = new Date(now + 60000);
      expect(computeElapsedSeconds(future, now)).toBe(0);
    });
  });
});
