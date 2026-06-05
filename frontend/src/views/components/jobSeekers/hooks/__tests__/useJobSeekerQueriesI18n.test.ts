import { readFileSync } from 'fs';
import { join } from 'path';

const settingsToastKeys = ['updateSuccess', 'updateError'];

describe('job seeker query hooks i18n', () => {
  it('does not hard-code user settings toast copy', () => {
    const source = readFileSync(join(__dirname, '../useJobSeekerQueries.ts'), 'utf8');

    expect(source).not.toContain('Settings updated successfully.');
    expect(source).not.toContain('Failed to update settings.');
    settingsToastKeys.forEach((key) => {
      expect(source).toContain(`jobSeeker:settings.toast.${key}`);
    });
  });

  it('has Vietnamese and English settings toast entries', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../../i18n/locales/vi/jobSeeker.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../../i18n/locales/en/jobSeeker.json'), 'utf8'));

    settingsToastKeys.forEach((key) => {
      expect(vi.settings?.toast?.[key]).toEqual(expect.any(String));
      expect(en.settings?.toast?.[key]).toEqual(expect.any(String));
    });
  });
});
