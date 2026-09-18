import { readFileSync } from 'fs';
import { join } from 'path';

describe('Admin Route Protection & AdminSectionClient Guard', () => {
  const layoutPath = join(__dirname, '../admin/layout.tsx');
  const clientGatePath = join(__dirname, '../admin/AdminSectionClient.tsx');
  const adminLayoutPath = join(__dirname, '../../layouts/AdminLayout/index.tsx');

  const layoutSource = readFileSync(layoutPath, 'utf8');
  const clientGateSource = readFileSync(clientGatePath, 'utf8');
  const adminLayoutSource = readFileSync(adminLayoutPath, 'utf8');

  it('wraps admin route segment with AdminSectionClient', () => {
    expect(layoutSource).toContain('<AdminSectionClient>{children}</AdminSectionClient>');
  });

  it('renders AdminLoginLayout for unauthenticated visitors and AdminLayout for logged-in admins', () => {
    expect(clientGateSource).toContain('<AdminLoginLayout>{children}</AdminLoginLayout>');
    expect(clientGateSource).toContain('<AdminLayout>{children}</AdminLayout>');
  });

  it('strictly validates ROLES_NAME.ADMIN and redirects non-admin users to homepage', () => {
    expect(clientGateSource).toContain('nextUser?.roleName && nextUser.roleName !== ROLES_NAME.ADMIN');
    expect(clientGateSource).toContain("window.location.replace('/')");
  });

  it('redirects already logged-in admin users from login page to dashboard', () => {
    expect(clientGateSource).toContain('isAuthPage && isLoginPage && nextUser?.roleName === ROLES_NAME.ADMIN');
    expect(clientGateSource).toContain('window.location.replace(dashboardPath)');
  });
});
