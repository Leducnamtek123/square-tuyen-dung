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
});
