// Jest globals: describe, it, expect
import { ROUTES, HOST_NAME, ROLES_NAME, AUTH_CONFIG } from '../../configs/constants';

describe('Application Constants', () => {
  describe('HOST_NAME', () => {
    it('should have PROJECT host name', () => {
      expect(HOST_NAME.PROJECT).toBeDefined();
      expect(typeof HOST_NAME.PROJECT).toBe('string');
    });

    it('should have EMPLOYER_PROJECT host name', () => {
      expect(HOST_NAME.EMPLOYER_PROJECT).toBeDefined();
    });

    it('should have ADMIN_PROJECT host name', () => {
      expect(HOST_NAME.ADMIN_PROJECT).toBeDefined();
    });
  });

  describe('ROUTES', () => {
    it('should have JOB_SEEKER routes', () => {
      expect(ROUTES.JOB_SEEKER).toBeDefined();
      expect(ROUTES.JOB_SEEKER.HOME).toBeDefined();
      expect(ROUTES.JOB_SEEKER.JOBS).toBeDefined();
    });

    it('should have EMPLOYER routes', () => {
      expect(ROUTES.EMPLOYER).toBeDefined();
    });

    it('should have AUTH routes', () => {
      expect(ROUTES.AUTH).toBeDefined();
      expect(ROUTES.AUTH.LOGIN).toBeDefined();
      expect(ROUTES.AUTH.REGISTER).toBeDefined();
    });

    it('should have ERROR routes', () => {
      expect(ROUTES.ERROR).toBeDefined();
      expect(ROUTES.ERROR.NOT_FOUND).toBeDefined();
      expect(ROUTES.ERROR.FORBIDDEN).toBeDefined();
    });
  });

  describe('ROLES_NAME', () => {
    it('should have all role types', () => {
      expect(ROLES_NAME).toBeDefined();
      expect(ROLES_NAME.ADMIN).toBeDefined();
    });
  });

  describe('AUTH_CONFIG', () => {
    it('should have auth configuration', () => {
      expect(AUTH_CONFIG).toBeDefined();
    });
  });
});
