import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../AdminLogin/index.tsx'), 'utf8');

describe('admin login routes', () => {
  it('redirects to the localized admin dashboard after login', () => {
    expect(source).toContain('localizeRoutePath');
    expect(source).toContain('ROUTES.ADMIN.DASHBOARD');
    expect(source).not.toContain("buildPortalPath('admin', '/dashboard'");
  });

  it('does not override only one Next Image logo dimension with CSS', () => {
    expect(source).not.toContain("style={{ height: 42, width: 'auto' }}");
  });
});
