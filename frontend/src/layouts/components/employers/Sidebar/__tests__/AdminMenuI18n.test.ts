import { readFileSync } from 'fs';
import { join } from 'path';

const readSource = (relativePath: string) => readFileSync(join(__dirname, relativePath), 'utf8');
const readLocale = (locale: 'en' | 'vi') =>
  JSON.parse(readFileSync(join(__dirname, `../../../../../i18n/locales/${locale}/admin.json`), 'utf8'));

describe('AdminMenu i18n', () => {
  it('does not hardcode admin sidebar labels that are visible in Vietnamese UI', () => {
    const source = readSource('../AdminMenu.tsx');

    ['Banner Types', 'AI Voice Profiles', 'Interview UI Preview'].forEach((label) => {
      expect(source).not.toContain(`text="${label}"`);
    });

    [
      'admin:sidebar.bannerTypes',
      'admin:sidebar.voiceProfiles',
      'admin:sidebar.interviewPreview',
    ].forEach((key) => {
      expect(source).toContain('t' + `('${key}')`);
    });

    (['en', 'vi'] as const).forEach((locale) => {
      const admin = readLocale(locale);
      expect(admin.sidebar.bannerTypes).toBeTruthy();
      expect(admin.sidebar.voiceProfiles).toBeTruthy();
      expect(admin.sidebar.interviewPreview).toBeTruthy();
    });
  });
});
