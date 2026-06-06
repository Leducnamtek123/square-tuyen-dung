import { readFileSync } from 'fs';
import { join } from 'path';

const readSidebarSource = (relativePath: string) =>
  readFileSync(join(__dirname, '..', relativePath), 'utf8');

describe('portal sidebar localized routes', () => {
  it('localizes drawer logo and passes current language into sidebar menus', () => {
    const source = readSidebarSource('DrawerContent.tsx');

    expect(source).toContain('localizeRoutePath');
    expect(source).toContain('i18n.language');
    expect(source).toContain('language={i18n.language}');
    expect(source).not.toContain('href={`/${isAdmin ? ROUTES.ADMIN.DASHBOARD : ROUTES.EMPLOYER.DASHBOARD}`}');
  });

  it('localizes employer sidebar routes and active matching', () => {
    const source = readSidebarSource('EmployerMenu.tsx');

    expect(source).toContain('localizeRoutePath');
    expect(source).toContain('getLocalizedRouteVariants');
    expect(source).not.toContain('to={`/${ROUTES.EMPLOYER');
    expect(source).not.toContain('location.pathname === `/${ROUTES.EMPLOYER');
  });

  it('localizes admin sidebar routes and active matching', () => {
    const source = readSidebarSource('AdminMenu.tsx');

    expect(source).toContain('localizeRoutePath');
    expect(source).toContain('getLocalizedRouteVariants');
    expect(source).toContain('ROUTES.ADMIN.INTERVIEW_PREVIEW');
    expect(source).not.toContain('to={`/${ROUTES.ADMIN');
    expect(source).not.toContain('location.pathname === `/${ROUTES.ADMIN');
    expect(source).not.toContain('to="/admin/interview-preview"');
    expect(source).not.toContain("location.pathname === '/admin/interview-preview'");
  });
});
