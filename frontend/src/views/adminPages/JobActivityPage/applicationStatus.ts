import type { ChipProps } from '@mui/material/Chip';

type ChipColor = ChipProps['color'];
type ChipVariant = ChipProps['variant'];

export type JobActivityStatusI18nKey =
  | 'pendingConfirmation'
  | 'contacted'
  | 'tested'
  | 'interviewed'
  | 'hired'
  | 'notSelected'
  | 'unknown';

export type JobActivityStatusOption = {
  id: number;
  i18nKey: JobActivityStatusI18nKey;
  color: ChipColor;
  variant: ChipVariant;
};

export const JOB_ACTIVITY_STATUS_OPTIONS: JobActivityStatusOption[] = [
  { id: 1, i18nKey: 'pendingConfirmation', color: 'default', variant: 'outlined' },
  { id: 2, i18nKey: 'contacted', color: 'info', variant: 'filled' },
  { id: 3, i18nKey: 'tested', color: 'warning', variant: 'filled' },
  { id: 4, i18nKey: 'interviewed', color: 'primary', variant: 'filled' },
  { id: 5, i18nKey: 'hired', color: 'success', variant: 'filled' },
  { id: 6, i18nKey: 'notSelected', color: 'error', variant: 'filled' },
];

export const UNKNOWN_JOB_ACTIVITY_STATUS_OPTION: JobActivityStatusOption = {
  id: 0,
  i18nKey: 'unknown',
  color: 'default',
  variant: 'outlined',
};

export const getJobActivityStatusOption = (status?: number | null): JobActivityStatusOption => (
  JOB_ACTIVITY_STATUS_OPTIONS.find((option) => option.id === status)
  || UNKNOWN_JOB_ACTIVITY_STATUS_OPTION
);
