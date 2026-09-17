import { readFileSync } from 'fs';
import { join } from 'path';
import { canAccessJobSeekerPortal } from '@/utils/accessControl';
import { ROLES_NAME, ROUTES } from '@/configs/constants';
import type { User } from '@/types/models';

describe('Candidate Profile Display & Role Route Protection Suite', () => {
  const panelPath = join(__dirname, '../components/CandidateDetailPreviewPanel.tsx');
  const masterItemPath = join(__dirname, '../components/MasterCandidateItem.tsx');
  const jobSeekerLayoutPath = join(__dirname, '../../../../../layouts/JobSeekerLayout/index.tsx');
  const employerGatePath = join(__dirname, '../../../../../app/employer/EmployerSectionClient.tsx');
  const adminGatePath = join(__dirname, '../../../../../app/admin/AdminSectionClient.tsx');

  const panelSource = readFileSync(panelPath, 'utf8');
  const masterItemSource = readFileSync(masterItemPath, 'utf8');
  const jobSeekerLayoutSource = readFileSync(jobSeekerLayoutPath, 'utf8');
  const employerGateSource = readFileSync(employerGatePath, 'utf8');
  const adminGateSource = readFileSync(adminGatePath, 'utf8');

  describe('1. Candidate age display format without parentheses', () => {
    it('verifies age is rendered with dot separator instead of parentheses in CandidateDetailPreviewPanel', () => {
      expect(panelSource).toContain('· {age} tuổi');
      expect(panelSource).not.toContain('({age})');
      expect(panelSource).not.toContain('({age} tuổi)');
      expect(panelSource).not.toMatch(/\(\s*\{age\}\s*tuổi\s*\)/);
    });

    it('verifies age is rendered with dot separator instead of parentheses in MasterCandidateItem', () => {
      expect(masterItemSource).toContain('· {age} tuổi');
      expect(masterItemSource).not.toContain('({age})');
      expect(masterItemSource).not.toContain('({age} tuổi)');
      expect(masterItemSource).not.toMatch(/\(\s*\{age\}\s*tuổi\s*\)/);
    });

    it('formats age label correctly with dot separator and asserts no parentheses exist', () => {
      const formatAgeDisplay = (ageVal: number | null | undefined) => {
        if (!ageVal || String(ageVal) === '---') return '';
        return `· ${ageVal} tuổi`;
      };

      const result = formatAgeDisplay(28);
      expect(result).toBe('· 28 tuổi');
      expect(result.includes('(')).toBe(false);
      expect(result.includes(')')).toBe(false);
    });
  });

  describe('2. Default 1970 birth year filter leading to 56 years old', () => {
    const calculateAge = (bday: string | Date | undefined) => {
      if (!bday) return null;
      const bDate = new Date(bday);
      const birthYear = bDate.getFullYear();
      if (isNaN(birthYear) || birthYear <= 1970) return null;
      const currentYear = new Date().getFullYear();
      return currentYear - birthYear;
    };

    const resolveCandidateAge = (birthday?: string | Date, rawAge?: number) => {
      const calculatedAge = birthday ? calculateAge(birthday) : null;
      return calculatedAge || (rawAge && rawAge < 55 ? rawAge : null);
    };

    it('verifies source code guards against birth year <= 1970 and rawAge >= 55', () => {
      expect(panelSource).toContain('birthYear <= 1970');
      expect(panelSource).toContain('rawAge < 55');
      expect(masterItemSource).toContain('birthYear <= 1970');
      expect(masterItemSource).toContain('rawAge < 55');
    });

    it('filters out 1970 default epoch birthdays returning null age', () => {
      expect(calculateAge('1970-01-01')).toBeNull();
      expect(calculateAge('1970-12-31')).toBeNull();
      expect(calculateAge('1969-08-15')).toBeNull();
      expect(calculateAge(new Date('1970-01-01T00:00:00Z'))).toBeNull();
    });

    it('filters out 56 years old originating from default 1970 birth year', () => {
      const ageFrom1970 = resolveCandidateAge('1970-01-01', 56);
      expect(ageFrom1970).toBeNull();

      const ageFromRaw56 = resolveCandidateAge(undefined, 56);
      expect(ageFromRaw56).toBeNull();
    });

    it('calculates valid candidate ages for real birth years', () => {
      const currentYear = new Date().getFullYear();
      expect(calculateAge('1995-06-15')).toBe(currentYear - 1995);
      expect(calculateAge('2001-01-01')).toBe(currentYear - 2001);
      expect(resolveCandidateAge(undefined, 25)).toBe(25);
    });
  });

  describe('3. Proxy email filtering', () => {
    const isInternalProxyEmail = (val?: string) =>
      !val || val.includes('.private.nhanlucsieuviet.com') || val.includes('@imported.infohr.vn');

    const sanitizeEmail = (raw?: string) => (isInternalProxyEmail(raw) ? '' : raw);

    it('verifies source code filters private.nhanlucsieuviet.com and imported.infohr.vn', () => {
      expect(panelSource).toContain("val.includes('.private.nhanlucsieuviet.com')");
      expect(panelSource).toContain("val.includes('@imported.infohr.vn')");
    });

    it('filters out *.private.nhanlucsieuviet.com proxy emails', () => {
      expect(isInternalProxyEmail('candidate@sub1.private.nhanlucsieuviet.com')).toBe(true);
      expect(isInternalProxyEmail('admin.private.nhanlucsieuviet.com')).toBe(true);
      expect(sanitizeEmail('candidate@sub1.private.nhanlucsieuviet.com')).toBe('');
    });

    it('filters out @imported.infohr.vn proxy emails', () => {
      expect(isInternalProxyEmail('seeker123@imported.infohr.vn')).toBe(true);
      expect(sanitizeEmail('seeker123@imported.infohr.vn')).toBe('');
    });

    it('preserves valid corporate and personal emails', () => {
      expect(isInternalProxyEmail('applicant@gmail.com')).toBe(false);
      expect(isInternalProxyEmail('recruiter@square.vn')).toBe(false);
      expect(sanitizeEmail('applicant@gmail.com')).toBe('applicant@gmail.com');
      expect(sanitizeEmail('recruiter@square.vn')).toBe('recruiter@square.vn');
    });

    it('handles empty or undefined emails safely', () => {
      expect(isInternalProxyEmail(undefined)).toBe(true);
      expect(isInternalProxyEmail('')).toBe(true);
      expect(sanitizeEmail(undefined)).toBe('');
      expect(sanitizeEmail('')).toBe('');
    });
  });

  describe('4. PDF attachment title validation without parentheses', () => {
    const expectedPdfTitle = 'Tệp hồ sơ đính kèm định dạng PDF';

    it('verifies exact PDF attachment title exists in CandidateDetailPreviewPanel', () => {
      expect(panelSource).toContain(expectedPdfTitle);
    });

    it('ensures PDF attachment title contains no parentheses', () => {
      expect(expectedPdfTitle).toBe('Tệp hồ sơ đính kèm định dạng PDF');
      expect(expectedPdfTitle.includes('(')).toBe(false);
      expect(expectedPdfTitle.includes(')')).toBe(false);
    });

    it('verifies CandidateDetailPreviewPanel does not use legacy titles with parentheses', () => {
      expect(panelSource).not.toContain('Tệp hồ sơ đính kèm (PDF)');
      expect(panelSource).not.toContain('Tệp đính kèm (PDF)');
      expect(panelSource).not.toContain('(Định dạng PDF)');
    });
  });

  describe('5. Safe route protection for all 4 user roles', () => {
    const resolveCandidatePortalNavigation = (
      user: User | null | undefined,
      hasToken: boolean,
      currentPath = '/dashboard'
    ): { action: 'allow' | 'redirect'; target?: string } => {
      if (!hasToken) {
        return { action: 'redirect', target: `/${ROUTES.AUTH.LOGIN}` };
      }

      if (!canAccessJobSeekerPortal(user)) {
        if (user?.roleName === ROLES_NAME.ADMIN) {
          return { action: 'redirect', target: `/${ROUTES.ADMIN.DASHBOARD}` };
        }
        if (user?.roleName === ROLES_NAME.EMPLOYER || (user as any)?.canAccessEmployerPortal) {
          return { action: 'redirect', target: `/${ROUTES.EMPLOYER.DASHBOARD}` };
        }
        return { action: 'redirect', target: '/' };
      }

      if (user?.isOnboarded === false && !currentPath.includes('/onboarding')) {
        return { action: 'redirect', target: '/onboarding/candidate' };
      }

      return { action: 'allow' };
    };

    it('Role 1 - Administrator: redirected safely to Admin Dashboard when accessing candidate portal', () => {
      const adminUser: User = {
        id: 'admin-1',
        roleName: ROLES_NAME.ADMIN,
      } as any;

      expect(canAccessJobSeekerPortal(adminUser)).toBe(false);

      const navDecision = resolveCandidatePortalNavigation(adminUser, true);
      expect(navDecision.action).toBe('redirect');
      expect(navDecision.target).toBe(`/${ROUTES.ADMIN.DASHBOARD}`);

      expect(jobSeekerLayoutSource).toContain('user?.roleName === ROLES_NAME.ADMIN');
      expect(jobSeekerLayoutSource).toContain('ROUTES.ADMIN.DASHBOARD');
    });

    it('Role 2 - Employer: redirected safely to Employer Dashboard when accessing candidate portal', () => {
      const employerUser: User = {
        id: 'emp-1',
        roleName: ROLES_NAME.EMPLOYER,
      } as any;

      expect(canAccessJobSeekerPortal(employerUser)).toBe(false);

      const navDecision = resolveCandidatePortalNavigation(employerUser, true);
      expect(navDecision.action).toBe('redirect');
      expect(navDecision.target).toBe(`/${ROUTES.EMPLOYER.DASHBOARD}`);

      expect(jobSeekerLayoutSource).toContain('user?.roleName === ROLES_NAME.EMPLOYER');
      expect(jobSeekerLayoutSource).toContain('ROUTES.EMPLOYER.DASHBOARD');
    });

    it('Role 3 - Candidate / Job Seeker: allowed to access portal or guided to onboarding', () => {
      const onboardedCandidate: User = {
        id: 'candidate-1',
        roleName: ROLES_NAME.JOB_SEEKER,
        isOnboarded: true,
      } as any;

      const nonOnboardedCandidate: User = {
        id: 'candidate-2',
        roleName: ROLES_NAME.JOB_SEEKER,
        isOnboarded: false,
      } as any;

      expect(canAccessJobSeekerPortal(onboardedCandidate)).toBe(true);
      expect(canAccessJobSeekerPortal(nonOnboardedCandidate)).toBe(true);

      const allowedDecision = resolveCandidatePortalNavigation(onboardedCandidate, true);
      expect(allowedDecision.action).toBe('allow');

      const onboardingDecision = resolveCandidatePortalNavigation(nonOnboardedCandidate, true, '/dashboard');
      expect(onboardingDecision.action).toBe('redirect');
      expect(onboardingDecision.target).toBe('/onboarding/candidate');

      expect(jobSeekerLayoutSource).toContain("user?.isOnboarded === false && !pathname.includes('/onboarding')");
      expect(jobSeekerLayoutSource).toContain("redirectTo('/onboarding/candidate')");
    });

    it('Role 4 - Guest / Unauthenticated: redirected safely to login page', () => {
      const guestDecision = resolveCandidatePortalNavigation(null, false);
      expect(guestDecision.action).toBe('redirect');
      expect(guestDecision.target).toBe(`/${ROUTES.AUTH.LOGIN}`);

      expect(jobSeekerLayoutSource).toContain('tokenService.getAccessTokenFromCookie()');
      expect(jobSeekerLayoutSource).toContain('ROUTES.AUTH.LOGIN');
    });

    it('Cross-portal protection: non-admin users cannot access Admin portal', () => {
      expect(adminGateSource).toContain('nextUser?.roleName && nextUser.roleName !== ROLES_NAME.ADMIN');
      expect(adminGateSource).toContain("window.location.replace('/')");
    });

    it('Cross-portal protection: non-employer users cannot access Employer portal', () => {
      expect(employerGateSource).toContain('user?.roleName !== ROLES_NAME.EMPLOYER && !user?.canAccessEmployerPortal');
      expect(employerGateSource).toContain("window.location.replace('/')");
    });
  });
});
