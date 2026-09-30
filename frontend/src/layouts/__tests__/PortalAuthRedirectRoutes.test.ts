import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../JobSeekerLayout/index.tsx'), 'utf8');

describe('portal auth redirect routes', () => {
  it('localizes admin and employer dashboard redirects from the job seeker guard', () => {
    expect(source).toContain('localizeRoutePath');
    expect(source).toContain('ROUTES.ADMIN.DASHBOARD');
    expect(source).toContain('ROUTES.EMPLOYER.DASHBOARD');
    expect(source).not.toContain('buildPortalPath("admin", "/dashboard"');
    expect(source).not.toContain('buildPortalPath("employer", "/dashboard"');
  });

  it('prevents flash of protected content during unauthorized redirects in employer and admin guards', () => {
    const employerSource = readFileSync(join(__dirname, '../../app/employer/EmployerSectionClient.tsx'), 'utf8');
    const adminSource = readFileSync(join(__dirname, '../../app/admin/AdminSectionClient.tsx'), 'utf8');

    // Neither guard should unconditionally dispatch checked in a .finally() block
    expect(employerSource).not.toContain("checkAuth().finally(() => dispatchAuthGate({ type: 'checked' }))");
    expect(adminSource).not.toContain("checkAuth().finally");

    // Both should dispatch checked conditionally
    expect(employerSource).toContain("dispatchAuthGate({ type: 'checked' })");
    expect(adminSource).toContain("dispatchAuthGate({ type: 'checked' })");
  });
});
