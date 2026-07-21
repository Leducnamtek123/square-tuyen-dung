import { readFileSync } from 'fs';
import { join } from 'path';

const readSource = (relativePath: string) => readFileSync(join(__dirname, relativePath), 'utf8');
const readCommonLocale = (locale: 'en' | 'vi') =>
  JSON.parse(readFileSync(join(__dirname, `../../../../i18n/locales/${locale}/common.json`), 'utf8'));

describe('User settings i18n', () => {
  it('does not hardcode notification settings labels or submit text', () => {
    const formSource = readSource('../SettingForm/index.tsx');
    const cardSource = readSource('../SettingCard/index.tsx');

    ['Enable email notifications', 'Enable SMS notifications', '>Update<'].forEach((literal) => {
      expect(`${formSource}\n${cardSource}`).not.toContain(literal);
    });

    expect(formSource).toContain("t('common:userSettings.emailNotifications')");
    expect(formSource).toContain("t('common:userSettings.smsNotifications')");
    expect(cardSource).toContain("t('common:actions.saveChanges')");

    (['en', 'vi'] as const).forEach((locale) => {
      const common = readCommonLocale(locale);
      expect(common.userSettings.emailNotifications).toEqual(expect.any(String));
      expect(common.userSettings.smsNotifications).toEqual(expect.any(String));
      expect(common.actions.saveChanges).toEqual(expect.any(String));
    });
  });
});
