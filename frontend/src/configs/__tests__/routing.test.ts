// Jest globals: describe, it, expect
import {
  getLocalizedRouteVariants,
} from '../../configs/routeLocalization';
import { 
  isAdminPortalPath, 
  isEmployerPortalPath,
  getPreferredLanguage,
  getPortalPrefix,
  detectPortalFromPath,
  stripPortalPrefix,
  buildPortalPath,
  normalizePortalPath
} from '../../configs/portalRouting';

describe('Portal Routing', () => {
  describe('getPreferredLanguage', () => {
    let originalWindow: typeof window;

    beforeEach(() => {
      originalWindow = global.window;
    });

    afterEach(() => {
      global.window = originalWindow;
    });

    it('should return vi if no localStorage is available', () => {
      delete (global as any).window;
      expect(getPreferredLanguage()).toBe('vi');
    });

    it('should normalize language correctly', () => {
      // Mock localStorage
      const mockGetItem = jest.fn();
      (global as any).window = {
        localStorage: {
          getItem: mockGetItem
        }
      };
      
      mockGetItem.mockReturnValue('en-US');
      expect(getPreferredLanguage()).toBe('en');

      mockGetItem.mockReturnValue('vi_VN');
      expect(getPreferredLanguage()).toBe('vi');
      
      mockGetItem.mockReturnValue('fr');
      expect(getPreferredLanguage()).toBe('vi');
    });
  });

  describe('getPortalPrefix', () => {
    it('should return admin prefixes', () => {
      expect(getPortalPrefix('admin', 'en')).toBe('/admin');
      expect(getPortalPrefix('admin', 'vi')).toBe('/quan-tri');
    });

    it('should return employer prefixes', () => {
      expect(getPortalPrefix('employer', 'en')).toBe('/employer');
      expect(getPortalPrefix('employer', 'vi')).toBe('/nha-tuyen-dung');
    });

    it('should return empty string for jobseeker', () => {
      expect(getPortalPrefix('jobseeker', 'vi')).toBe('');
    });
  });

  describe('detectPortalFromPath', () => {
    it('detects admin portals', () => {
      expect(detectPortalFromPath('/admin')).toBe('admin');
      expect(detectPortalFromPath('/quan-tri/dashboard')).toBe('admin');
    });

    it('detects employer portals', () => {
      expect(detectPortalFromPath('/employer')).toBe('employer');
      expect(detectPortalFromPath('/employer/')).toBe('employer');
      expect(detectPortalFromPath('/nha-tuyen-dung')).toBe('employer');
    });

    it('defaults to jobseeker', () => {
      expect(detectPortalFromPath('/')).toBe('jobseeker');
      expect(detectPortalFromPath('/viec-lam')).toBe('jobseeker');
      // non prefix match
      expect(detectPortalFromPath('/administrator')).toBe('jobseeker');
    });
  });

  describe('stripPortalPrefix', () => {
    it('strips admin prefixes', () => {
      expect(stripPortalPrefix('/admin/dashboard')).toBe('/dashboard');
      expect(stripPortalPrefix('/quan-tri')).toBe('/');
    });

    it('strips employer prefixes', () => {
      expect(stripPortalPrefix('/employer/jobs')).toBe('/jobs');
      expect(stripPortalPrefix('/nha-tuyen-dung/profile')).toBe('/profile');
    });

    it('returns path intact for jobseeker', () => {
      expect(stripPortalPrefix('/viec-lam')).toBe('/viec-lam');
    });
  });

  describe('buildPortalPath', () => {
    it('builds paths with prefixes', () => {
      expect(buildPortalPath('admin', '/dashboard', 'en')).toBe('/admin/dashboard');
      expect(buildPortalPath('employer', 'jobs', 'vi')).toBe('/nha-tuyen-dung/jobs');
      expect(buildPortalPath('employer', '/', 'vi')).toBe('/nha-tuyen-dung');
    });

    it('builds jobseeker paths without prefixes', () => {
      expect(buildPortalPath('jobseeker', 'dashboard', 'vi')).toBe('/dashboard');
    });
  });

  describe('normalizePortalPath', () => {
    it('normalizes paths keeping the portal correctly', () => {
      expect(normalizePortalPath('/admin/dashboard', 'en')).toBe('/admin/dashboard');
      expect(normalizePortalPath('/quan-tri/dashboard', 'en')).toBe('/admin/dashboard');
      expect(normalizePortalPath('/employer/jobs', 'vi')).toBe('/nha-tuyen-dung/jobs');
    });

    it('normalizes jobseeker paths', () => {
      expect(normalizePortalPath('/viec-lam', 'en')).toBe('/viec-lam');
    });
  });

  describe('isAdminPortalPath', () => {
    it('should identify admin paths', () => {
      expect(isAdminPortalPath('/admin')).toBe(true);
      expect(isAdminPortalPath('/admin/dashboard')).toBe(true);
    });

    it('should reject non-admin paths', () => {
      expect(isAdminPortalPath('/')).toBe(false);
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
