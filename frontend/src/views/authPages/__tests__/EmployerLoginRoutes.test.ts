import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../EmployerLogin/index.tsx'), 'utf8');

describe('employer login routes', () => {
  it('redirects to the localized employer dashboard after login', () => {
    expect(source).toContain('localizeRoutePath');
    expect(source).toContain('i18n.language');
    expect(source).not.toContain('return `/${ROUTES.EMPLOYER.DASHBOARD}`');
  });

  it('keeps forgot password and register links in the employer auth flow', () => {
    expect(source).toContain('ROUTES.EMPLOYER_AUTH.FORGOT_PASSWORD');
    expect(source).toContain('ROUTES.EMPLOYER_AUTH.REGISTER');
    expect(source).not.toContain('href={`/${ROUTES.AUTH.FORGOT_PASSWORD}`}');
    expect(source).not.toContain('href={`/${ROUTES.AUTH.REGISTER}`}');
  });
});
