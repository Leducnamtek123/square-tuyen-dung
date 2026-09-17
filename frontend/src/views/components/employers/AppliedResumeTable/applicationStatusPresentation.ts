export type AppliedStatusTone = 'default' | 'info' | 'warning' | 'primary' | 'success' | 'error';

export interface StatusThemeConfig {
  bg: string;
  border: string;
  text: string;
  dot: string;
  hoverBg: string;
}

export const APPLIED_STATUS_THEMES: Record<number, StatusThemeConfig> = {
  1: { // Chờ xác nhận (Pending Confirmation)
    bg: '#FEF3C7',
    border: '#FDE68A',
    text: '#B45309',
    dot: '#F59E0B',
    hoverBg: '#FDE68A',
  },
  2: { // Đã liên hệ (Contacted)
    bg: '#F3E8FF',
    border: '#E9D5FF',
    text: '#6B21A8',
    dot: '#9333EA',
    hoverBg: '#E9D5FF',
  },
  3: { // Đã làm bài test (Tested)
    bg: '#E0F2FE',
    border: '#BAE6FD',
    text: '#0369A1',
    dot: '#0284C7',
    hoverBg: '#BAE6FD',
  },
  4: { // Đã phỏng vấn (Interviewed)
    bg: '#DBEAFE',
    border: '#BFDBFE',
    text: '#1D4ED8',
    dot: '#2563EB',
    hoverBg: '#BFDBFE',
  },
  5: { // Đã tuyển dụng (Hired) - Emerald Green!
    bg: '#DCFCE7',
    border: '#86EFAC',
    text: '#15803D',
    dot: '#16A34A',
    hoverBg: '#BBF7D0',
  },
  6: { // Không trúng tuyển / Không phù hợp (Not Selected)
    bg: '#FEE2E2',
    border: '#FECACA',
    text: '#B91C1C',
    dot: '#DC2626',
    hoverBg: '#FECACA',
  },
};

export const getAppliedStatusConfig = (status?: number | null): StatusThemeConfig => {
  return APPLIED_STATUS_THEMES[Number(status)] || {
    bg: '#F1F5F9',
    border: '#E2E8F0',
    text: '#475569',
    dot: '#94A3B8',
    hoverBg: '#E2E8F0',
  };
};

export const getAppliedStatusTone = (status?: number | null): AppliedStatusTone => {
  switch (status) {
    case 2:
      return 'info';
    case 3:
      return 'warning';
    case 4:
      return 'primary';
    case 5:
      return 'success';
    case 6:
      return 'error';
    case 1:
    default:
      return 'default';
  }
};

