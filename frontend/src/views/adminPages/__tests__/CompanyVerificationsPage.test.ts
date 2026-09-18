import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Admin Company Verifications & Trust Reports Architecture', () => {
  const verificationFile = join(__dirname, '../CompanyVerificationsPage/index.tsx');
  const trustReportsFile = join(__dirname, '../TrustReportsPage/index.tsx');

  it('verifies CompanyVerificationsPage and TrustReportsPage exist', () => {
    expect(existsSync(verificationFile)).toBe(true);
    expect(existsSync(trustReportsFile)).toBe(true);
  });

  it('implements KYC verification actions and AdminDataGrid in CompanyVerificationsPage', () => {
    const source = readFileSync(verificationFile, 'utf8');
    expect(source).toContain('AdminDataGrid');
    expect(source).toContain('AdminStatusBadge');
    expect(source).toContain('AdminConfirmDialog');
    expect(source).toContain('AdminDetailDrawer');
    expect(source).toContain('updateCompanyVerification');
  });

  it('implements trust reports review and resolution in TrustReportsPage', () => {
    const source = readFileSync(trustReportsFile, 'utf8');
    expect(source).toContain('DataTable');
    expect(source).toContain('FilterBar');
    expect(source).toContain('AdminStatusBadge');
    expect(source).toContain('AdminConfirmDialog');
    expect(source).toContain('AdminDetailDrawer');
    expect(source).toContain('updateTrustReport');
  });
});
