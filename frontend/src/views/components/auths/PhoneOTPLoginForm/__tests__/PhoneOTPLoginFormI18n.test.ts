import { readFileSync } from 'fs';
import { join } from 'path';

describe('PhoneOTPLoginForm i18n', () => {
  it('does not hard-code fallback text for localized OTP copy', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
    const localizedKeys = [
      'login.phoneProviderDisabled',
      'login.phoneBillingNotEnabled',
      'login.phoneTooManyRequests',
      'login.unauthorizedDomain',
      'login.phoneInvalid',
      'login.resendIn',
      'actions.verifyOTP',
      'actions.changePhone',
      'actions.resendOTP',
    ];
    const localizedCalls = localizedKeys.map((key) => {
      const pattern = new RegExp(`t\\('${key.replace('.', '\\.')}'[\\s\\S]*?\\)`);
      return [key, source.match(pattern)?.[0] || ''] as const;
    });

    for (const [key, call] of localizedCalls) {
      expect(call).toContain(`t('${key}'`);
      expect(call).not.toContain('defaultValue');
      expect(call).not.toMatch(new RegExp(`t\\('${key.replace('.', '\\.')}'\\s*,\\s*['"]`));
    }
  });
});
