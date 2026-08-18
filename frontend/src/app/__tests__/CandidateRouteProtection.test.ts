import { readFileSync } from 'fs';
import { join } from 'path';

describe('Candidate Route Protection & JobSeekerLayout Guard', () => {
  const layoutCandidatePath = join(__dirname, '../(candidate)/layout.tsx');
  const jobSeekerLayoutPath = join(__dirname, '../../layouts/JobSeekerLayout/index.tsx');

  const layoutCandidateSource = readFileSync(layoutCandidatePath, 'utf8');
  const jobSeekerLayoutSource = readFileSync(jobSeekerLayoutPath, 'utf8');

  it('wraps (candidate) route segment with JobSeekerLayout', () => {
    expect(layoutCandidateSource).toContain('<JobSeekerLayout>{children}</JobSeekerLayout>');
  });

  it('checks authentication token from cookies and redirects unauthenticated users to login', () => {
    expect(jobSeekerLayoutSource).toContain('tokenService.getAccessTokenFromCookie()');
    expect(jobSeekerLayoutSource).toContain('ROUTES.AUTH.LOGIN');
  });

  it('restricts candidate portal access using canAccessJobSeekerPortal guard', () => {
    expect(jobSeekerLayoutSource).toContain('canAccessJobSeekerPortal(user)');
    expect(jobSeekerLayoutSource).toContain('ROLES_NAME.ADMIN');
    expect(jobSeekerLayoutSource).toContain('ROLES_NAME.EMPLOYER');
  });

  it('redirects non-onboarded candidates to /onboarding/candidate', () => {
    expect(jobSeekerLayoutSource).toContain("user?.isOnboarded === false && !pathname.includes('/onboarding')");
    expect(jobSeekerLayoutSource).toContain("redirectTo('/onboarding/candidate')");
  });
});
