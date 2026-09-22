import { ROLES_NAME } from '@/configs/constants';
import { canAccessJobSeekerPortal } from '@/utils/accessControl';
import tokenService from '@/services/tokenService';
import Cookies from 'js-cookie';

jest.mock('js-cookie');

describe('Auth & Route Guard Edge Cases & Role Mismatch Resilience', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Token & Cookie Corruption at Route Gate', () => {
    it('detects missing or corrupted tokens and triggers login redirection', () => {
      // 1. Missing cookie
      (Cookies.get as jest.Mock).mockReturnValue(undefined);
      expect(Boolean(tokenService.getAccessTokenFromCookie())).toBe(false);

      // 2. Corrupted cookie with 'null' string
      (Cookies.get as jest.Mock).mockReturnValue('null');
      expect(Boolean(tokenService.getAccessTokenFromCookie())).toBe(false);

      // 3. Corrupted cookie with 'undefined' string
      (Cookies.get as jest.Mock).mockReturnValue('undefined');
      expect(Boolean(tokenService.getAccessTokenFromCookie())).toBe(false);

      // 4. Corrupted cookie with '[object Object]'
      (Cookies.get as jest.Mock).mockReturnValue('[object Object]');
      expect(Boolean(tokenService.getAccessTokenFromCookie())).toBe(false);

      // 5. Valid JWT token
      (Cookies.get as jest.Mock).mockReturnValue('valid-bearer-token');
      expect(Boolean(tokenService.getAccessTokenFromCookie())).toBe(true);
    });
  });

  describe('Candidate Portal Guard (canAccessJobSeekerPortal)', () => {
    it('allows users with JOB_SEEKER role', () => {
      const candidateUser: any = { id: 1, roleName: ROLES_NAME.JOB_SEEKER };
      expect(canAccessJobSeekerPortal(candidateUser)).toBe(true);
    });

    it('rejects null, undefined, or missing user objects', () => {
      expect(canAccessJobSeekerPortal(null)).toBe(false);
      expect(canAccessJobSeekerPortal(undefined)).toBe(false);
      expect(canAccessJobSeekerPortal({} as any)).toBe(false);
    });

    it('rejects role mismatch: employer accessing candidate portal', () => {
      const employerUser: any = { id: 2, roleName: ROLES_NAME.EMPLOYER };
      expect(canAccessJobSeekerPortal(employerUser)).toBe(false);
    });

    it('rejects role mismatch: admin accessing candidate portal directly', () => {
      const adminUser: any = { id: 3, roleName: ROLES_NAME.ADMIN };
      expect(canAccessJobSeekerPortal(adminUser)).toBe(false);
    });
  });

  describe('Employer & Admin Portal Role Authorization Logic', () => {
    it('validates employer access: strictly requires EMPLOYER role or canAccessEmployerPortal flag', () => {
      const isEmployerAuthorized = (user: any) =>
        user?.roleName === ROLES_NAME.EMPLOYER || Boolean(user?.canAccessEmployerPortal);

      expect(isEmployerAuthorized({ roleName: ROLES_NAME.EMPLOYER })).toBe(true);
      expect(isEmployerAuthorized({ roleName: ROLES_NAME.JOB_SEEKER, canAccessEmployerPortal: true })).toBe(true);
      expect(isEmployerAuthorized({ roleName: ROLES_NAME.JOB_SEEKER })).toBe(false);
      expect(isEmployerAuthorized(null)).toBe(false);
    });

    it('validates admin access: strictly requires ADMIN role', () => {
      const isAdminAuthorized = (user: any) => user?.roleName === ROLES_NAME.ADMIN;

      expect(isAdminAuthorized({ roleName: ROLES_NAME.ADMIN })).toBe(true);
      expect(isAdminAuthorized({ roleName: ROLES_NAME.EMPLOYER })).toBe(false);
      expect(isAdminAuthorized({ roleName: ROLES_NAME.JOB_SEEKER })).toBe(false);
      expect(isAdminAuthorized(null)).toBe(false);
    });

    it('identifies un-onboarded state for candidate and employer accounts', () => {
      const needsOnboarding = (user: any, path: string) =>
        user?.isOnboarded === false && !path.includes('/onboarding');

      expect(needsOnboarding({ isOnboarded: false }, '/employer/dashboard')).toBe(true);
      expect(needsOnboarding({ isOnboarded: false }, '/employer/onboarding')).toBe(false);
      expect(needsOnboarding({ isOnboarded: true }, '/employer/dashboard')).toBe(false);
      expect(needsOnboarding(null, '/employer/dashboard')).toBe(false);
    });
  });
});
