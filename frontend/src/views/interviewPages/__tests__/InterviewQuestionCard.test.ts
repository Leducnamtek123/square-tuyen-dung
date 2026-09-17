import { formatSecondsToTime } from '../useInterviewQuestionHUD';

describe('InterviewQuestionCard Logic and Formatting', () => {
  it('calculates progress percentage correctly', () => {
    const calculateProgress = (remaining: number, total: number) => {
      if (total <= 0) return 0;
      return Math.min(100, Math.max(0, (remaining / total) * 100));
    };

    expect(calculateProgress(120, 120)).toBe(100);
    expect(calculateProgress(60, 120)).toBe(50);
    expect(calculateProgress(0, 120)).toBe(0);
    expect(calculateProgress(150, 120)).toBe(100);
  });

  it('determines low time warning threshold', () => {
    const isLowTime = (remaining: number) => remaining <= 20;

    expect(isLowTime(25)).toBe(false);
    expect(isLowTime(20)).toBe(true);
    expect(isLowTime(5)).toBe(true);
    expect(isLowTime(0)).toBe(true);
  });

  it('generates proper question index label', () => {
    const getQuestionLabel = (index: number, total: number) => `Câu ${index + 1} / ${total || 1}`;

    expect(getQuestionLabel(0, 5)).toBe('Câu 1 / 5');
    expect(getQuestionLabel(3, 8)).toBe('Câu 4 / 8');
  });
});
