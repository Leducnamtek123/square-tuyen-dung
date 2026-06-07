export type AppliedStatusTone = 'default' | 'info' | 'warning' | 'primary' | 'success' | 'error';

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
