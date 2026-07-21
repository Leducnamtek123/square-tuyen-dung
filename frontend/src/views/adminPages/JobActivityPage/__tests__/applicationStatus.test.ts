import {
  JOB_ACTIVITY_STATUS_OPTIONS,
  getJobActivityStatusOption,
} from '../applicationStatus';

describe('admin job activity application status mapping', () => {
  it('matches the backend ApplicationStatus choices exactly', () => {
    expect(JOB_ACTIVITY_STATUS_OPTIONS.map((option) => [option.id, option.i18nKey])).toEqual([
      [1, 'pendingConfirmation'],
      [2, 'contacted'],
      [3, 'tested'],
      [4, 'interviewed'],
      [5, 'hired'],
      [6, 'notSelected'],
    ]);
  });

  it('keeps terminal statuses visually distinct', () => {
    expect(getJobActivityStatusOption(5)).toMatchObject({ i18nKey: 'hired', color: 'success' });
    expect(getJobActivityStatusOption(6)).toMatchObject({ i18nKey: 'notSelected', color: 'error' });
  });

  it('falls back safely for an unknown status from old data', () => {
    expect(getJobActivityStatusOption(99)).toMatchObject({ i18nKey: 'unknown', color: 'default' });
  });
});
