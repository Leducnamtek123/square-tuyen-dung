import { readFileSync } from 'fs';
import { join } from 'path';

const readCommonSource = (relativePath: string) =>
  readFileSync(join(__dirname, '..', relativePath), 'utf8');

describe('common employer navigation routes', () => {
  it('localizes employer links in the common header', () => {
    const source = readCommonSource('Header/index.tsx');

    expect(source).toContain('localizeRoutePath');
    expect(source).toContain('i18n.language');
    expect(source).not.toContain("path: `/${ROUTES.EMPLOYER.INTRODUCE}`");
    expect(source).not.toContain("path: `/${ROUTES.EMPLOYER.SERVICE}`");
    expect(source).not.toContain("path: `/${ROUTES.EMPLOYER.PRICING}`");
    expect(source).not.toContain("path: `/${ROUTES.EMPLOYER.SUPPORT}`");
    expect(source).toContain('localizeRoutePath(`/${ROUTES.EMPLOYER.BLOG}`, i18n.language)');
  });

  it('localizes employer links in the common footer', () => {
    const source = readCommonSource('Footer/index.tsx');

    expect(source).toContain('localizeRoutePath');
    expect(source).not.toContain("route: `/${ROUTES.EMPLOYER.JOB_POST}`");
    expect(source).not.toContain("route: `/${ROUTES.EMPLOYER.PROFILE}`");
    expect(source).not.toContain("route: `/${ROUTES.EMPLOYER.DASHBOARD}`");
  });
});
