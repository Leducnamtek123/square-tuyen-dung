import { readFileSync } from 'fs';
import { join } from 'path';

const readCommonSource = (relativePath: string) =>
  readFileSync(join(__dirname, '..', relativePath), 'utf8');

describe('workspace portal route redirects', () => {
  it('localizes workspace switch redirects before building the cross-host URL', () => {
    const source = readCommonSource('WorkspaceSwitchMenu/index.tsx');

    expect(source).toContain('localizeRoutePath');
    expect(source).toContain('getPreferredLanguage');
    expect(source).not.toContain('normalizedPath || `/${ROUTES.EMPLOYER.DASHBOARD}`');
    expect(source).not.toContain('${mainHost}${port}${normalizedPath');
  });

  it('localizes user menu workspace redirects before building the cross-host URL', () => {
    const source = readCommonSource('UserMenu/index.tsx');

    expect(source).toContain('localizeRoutePath');
    expect(source).toContain('i18n.language');
    expect(source).not.toContain('normalizedPath || `/${ROUTES.EMPLOYER.DASHBOARD}`');
    expect(source).not.toContain('${HOST_NAME.PROJECT}${port}${targetPath}');
    expect(source).not.toContain('buildPortalPath("admin", "/dashboard"');
  });
});
