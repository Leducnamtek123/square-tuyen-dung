import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../errorHandling.ts'), 'utf8');

const errorKeys = [
  'common:errors.networkError',
  'common:errors.generic',
  'common:errors.unauthorized',
  'common:errors.forbidden',
  'common:errors.notFound',
  'common:errors.payloadTooLarge',
  'common:errors.tooManyRequests',
  'common:errors.serverError',
];

describe('errorHandling i18n', () => {
  it('does not hide missing common error keys with hard-coded English fallback copy', () => {
    [
      'Unable to connect to server',
      'An error occurred, please try again.',
      'Your session has expired',
      'You do not have permission',
      'The requested resource was not found.',
      'The file is too large.',
      'Too many requests',
      'Server error',
    ].forEach((copy) => {
      expect(source).not.toContain(copy);
    });

    errorKeys.forEach((key) => {
      expect(source).toContain(`i18n.t('${key}')`);
    });
  });

  it('has Vietnamese and English locale entries for common API error toasts', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../i18n/locales/vi/common.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../i18n/locales/en/common.json'), 'utf8'));

    errorKeys.forEach((key) => {
      const [, path] = key.split(':');
      const segments = path.split('.');
      const readKey = (locale: Record<string, unknown>) => segments.reduce<unknown>(
        (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
        locale
      );

      expect(readKey(vi)).toEqual(expect.any(String));
      expect(readKey(en)).toEqual(expect.any(String));
    });
  });
});
