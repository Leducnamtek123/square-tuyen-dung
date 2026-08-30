import { formatMessageDate, formatMessageTime, formatDateDivider } from '../dateHelper';
import dayjs from 'dayjs';

describe('dateHelper for Chat', () => {
  it('formats today message time correctly', () => {
    const now = new Date();
    const formatted = formatMessageTime(now);
    expect(formatted).toBe(dayjs(now).format('HH:mm'));
  });

  it('formats yesterday message time correctly', () => {
    const yesterday = dayjs().subtract(1, 'day').toDate();
    const formatted = formatMessageTime(yesterday);
    expect(formatted).toBe('Hôm qua');
  });

  it('returns empty string for null or undefined timestamps', () => {
    expect(formatMessageTime(null)).toBe('');
    expect(formatMessageTime(undefined)).toBe('');
    expect(formatDateDivider(null)).toBe('');
    expect(formatDateDivider(undefined)).toBe('');
  });

  it('formats date divider for today and past days', () => {
    const today = new Date();
    expect(formatDateDivider(today)).toBe('Hôm nay');

    const yesterday = dayjs().subtract(1, 'day').toDate();
    expect(formatDateDivider(yesterday)).toBe('Hôm qua');

    const pastDate = dayjs('2026-05-15').toDate();
    expect(formatDateDivider(pastDate)).toContain('15 Tháng 05, 2026');
  });

  it('formats message date string with calendar helper', () => {
    const today = new Date();
    const formatted = formatMessageDate(today);
    expect(formatted).toContain('Hôm nay lúc');
  });
});
