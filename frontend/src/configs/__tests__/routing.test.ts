import { describe, it, expect } from 'vitest';
import {
  getLocalizedRouteVariants,
} from '../../configs/routeLocalization';
import { isAdminPortalPath, isEmployerPortalPath } from '../../configs/portalRouting';

describe('Portal Routing', () => {
  describe('isAdminPortalPath', () => {
    it('should identify admin paths', () => {
      expect(isAdminPortalPath('/admin')).toBe(true);
      expect(isAdminPortalPath('/admin/dashboard')).toBe(true);
      expect(isAdminPortalPath('/admin/users')).toBe(true);
    });

    it('should reject non-admin paths', () => {
      expect(isAdminPortalPath('/')).toBe(false);
      expect(isAdminPortalPath('/viec-lam')).toBe(false);
      expect(isAdminPortalPath('/employer')).toBe(false);
    });
  });

  describe('isEmployerPortalPath', () => {
    it('should identify employer paths', () => {
      expect(isEmployerPortalPath('/employer')).toBe(true);
      expect(isEmployerPortalPath('/employer/dashboard')).toBe(true);
    });

    it('should reject non-employer paths', () => {
      expect(isEmployerPortalPath('/')).toBe(false);
      expect(isEmployerPortalPath('/admin')).toBe(false);
      expect(isEmployerPortalPath('/viec-lam')).toBe(false);
    });
  });
});

describe('Route Localization', () => {
  it('should return route variants', () => {
    const variants = getLocalizedRouteVariants('viec-lam');
    expect(Array.isArray(variants)).toBe(true);
    expect(variants.length).toBeGreaterThanOrEqual(1);
    expect(variants).toContain('viec-lam');
  });

  it('should handle paths without localization', () => {
    const variants = getLocalizedRouteVariants('some-unknown-path');
    expect(Array.isArray(variants)).toBe(true);
    expect(variants.length).toBeGreaterThanOrEqual(1);
  });
});
