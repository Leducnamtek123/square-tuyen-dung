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

  it('localizes company workspace roleCode using i18n keys', () => {
    const source = readCommonSource('UserMenu/index.tsx');

    expect(source).toContain('nav.workspaceRoles.');
    expect(source).not.toContain('${workspace.label} (${workspace.roleCode');
  });

  it('redirects un-onboarded candidates and employers directly to their onboarding steps in UserMenu and WorkspaceSwitchMenu', () => {
    const userMenuSource = readCommonSource('UserMenu/index.tsx');
    const switchMenuSource = readCommonSource('WorkspaceSwitchMenu/index.tsx');

    expect(userMenuSource).toContain("currentUser?.isOnboarded === false");
    expect(userMenuSource).toContain("window.location.href = '/onboarding/candidate'");
    expect(userMenuSource).toContain("window.location.href = '/onboarding/employer'");
    expect(userMenuSource).toContain("workspaces.length === 0 && currentUser");

    expect(switchMenuSource).toContain("currentUser?.isOnboarded === false");
    expect(switchMenuSource).toContain("window.location.href = '/onboarding/candidate'");
    expect(switchMenuSource).toContain("window.location.href = '/onboarding/employer'");
  });
});
