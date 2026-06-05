import { readFileSync } from 'fs';
import { join } from 'path';

const readSource = (relativePath: string) => readFileSync(join(__dirname, relativePath), 'utf8');
const readLocale = (locale: 'en' | 'vi') =>
  JSON.parse(readFileSync(join(__dirname, `../../../i18n/locales/${locale}/auth.json`), 'utf8'));

describe('ResetPasswordPage redirect i18n', () => {
  it('redirects with a localized success message key instead of hard-coded English copy', () => {
    const resetPasswordSource = readSource('../ResetPasswordPage/index.tsx');
    const jobSeekerLoginSource = readSource('../JobSeekerLogin/index.tsx');
    const employerLoginSource = readSource('../EmployerLogin/index.tsx');

    expect(resetPasswordSource).not.toContain('Password updated successfully');
    expect(resetPasswordSource).toContain('successMessageKey=passwordResetSuccess');

    [jobSeekerLoginSource, employerLoginSource].forEach((source) => {
      expect(source).toContain('successMessageKey');
      expect(source).toContain('messages.passwordResetSuccess');
    });
  });

  it('has reset password success locale entries in English and Vietnamese', () => {
    expect(readLocale('en').messages.passwordResetSuccess).toEqual(expect.any(String));
    expect(readLocale('vi').messages.passwordResetSuccess).toEqual(expect.any(String));
  });
});
