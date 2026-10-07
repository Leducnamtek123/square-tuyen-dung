import { readFileSync } from 'fs';
import { join } from 'path';

describe('Employer Route Protection & EmployerSectionClient Guard', () => {
  const layoutPath = join(__dirname, '../employer/layout.tsx');
  const clientGatePath = join(__dirname, '../employer/EmployerSectionClient.tsx');
  const layoutEmployerPath = join(__dirname, '../../layouts/EmployerLayout/index.tsx');

  const layoutSource = readFileSync(layoutPath, 'utf8');
  const clientGateSource = readFileSync(clientGatePath, 'utf8');
  const layoutEmployerSource = readFileSync(layoutEmployerPath, 'utf8');

  it('wraps employer route segment with EmployerSectionClient', () => {
    expect(layoutSource).toContain('<EmployerSectionClient>{children}</EmployerSectionClient>');
  });

  it('distinguishes public marketing/auth paths from protected portal paths', () => {
    expect(clientGateSource).toContain('DEFAULT_LAYOUT_PATHS');
    expect(clientGateSource).toContain('CHAT_LAYOUT_PATHS');
    expect(clientGateSource).toContain('EmployerLayout');
  });

  it('restricts portal access to users with employer role or employer portal permissions', () => {
    expect(clientGateSource).toContain('ROLES_NAME.EMPLOYER');
    expect(clientGateSource).toContain('canAccessEmployerPortal');
  });

  it('redirects un-onboarded employers to /onboarding/employer', () => {
    expect(clientGateSource).toContain("user?.isOnboarded === false && !pathname.includes('/onboarding')");
    expect(clientGateSource).toContain("window.location.replace('/onboarding/employer')");
  });

  it('includes both localized and English chat paths for employer domain', () => {
    expect(clientGateSource).toContain("'/ket-noi-voi-ung-vien'");
    expect(clientGateSource).toContain("'/chat'");
    expect(clientGateSource).toContain("strippedPath === '/ket-noi-voi-ung-vien'");
  });
});
