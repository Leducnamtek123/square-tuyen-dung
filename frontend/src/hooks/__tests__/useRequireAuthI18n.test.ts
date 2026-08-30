import { readFileSync } from 'fs';
import { join } from 'path';

const authModalSource = readFileSync(join(__dirname, '../../components/Common/AuthRequiredModal/index.tsx'), 'utf8');
const useRequireAuthSource = readFileSync(join(__dirname, '../useRequireAuth.tsx'), 'utf8');

const requiredAuthKeys = [
  'authRequired.title',
  'authRequired.defaultMsg',
  'authRequired.saveJobMsg',
  'authRequired.applyJobMsg',
  'authRequired.followCompanyMsg',
  'authRequired.loginBtn',
  'authRequired.registerPrompt',
  'authRequired.registerBtn',
  'authRequired.closeBtn',
];

describe('useRequireAuth and AuthRequiredModal i18n & structure', () => {
  it('defines all required authRequired translation keys in both vi and en locales', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../i18n/locales/vi/public.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../i18n/locales/en/public.json'), 'utf8'));

    requiredAuthKeys.forEach((key) => {
      const readKey = (locale: Record<string, unknown>) => key.split('.').reduce<unknown>(
        (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
        locale
      );

      expect(readKey(vi)).toEqual(expect.any(String));
      expect(readKey(en)).toEqual(expect.any(String));
    });
  });

  it('contains proper routing and return redirect parameter logic in AuthRequiredModal', () => {
    expect(authModalSource).toContain('redirect=');
    expect(authModalSource).toContain('defaultLoginRoute');
    expect(authModalSource).toContain('defaultRegisterRoute');
    expect(authModalSource).toContain('AuthRequiredModal');
    expect(authModalSource).toContain('ensureLeadingSlash');
    expect(authModalSource).toContain('`/${ROUTES.AUTH.LOGIN}`');
    expect(authModalSource).toContain('`/${ROUTES.AUTH.REGISTER}`');
  });

  it('provides requireAuth and AuthModal in useRequireAuth hook', () => {
    expect(useRequireAuthSource).toContain('requireAuth');
    expect(useRequireAuthSource).toContain('AuthModal');
    expect(useRequireAuthSource).toContain('isAuthenticated');
  });
});
