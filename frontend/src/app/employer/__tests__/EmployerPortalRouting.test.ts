import { readFileSync } from 'fs';
import { resolve } from 'path';
import { NextRequest } from 'next/server';
import { proxy, middleware } from '@/proxy';
import EmployerServicePage from '../service/page';

// Mock next/navigation redirect
const mockRedirect = jest.fn();
jest.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    const error = new Error('NEXT_REDIRECT');
    (error as any).digest = `NEXT_REDIRECT;${url}`;
    throw error;
  },
}));

describe('Employer Portal Routing & Proxy Mapping', () => {
  beforeEach(() => {
    mockRedirect.mockClear();
  });

  describe('Static Proxy Configuration Integrity', () => {
    const proxySource = readFileSync(
      resolve(__dirname, '../../../../src/proxy.ts'),
      'utf-8'
    );

    it('maps root / to /employer in EMPLOYER_EXACT_MAP', () => {
      expect(proxySource).toMatch(/'\/':\s*['"]\/employer['"]/);
    });

    it('maps /gioi-thieu and /introduce to /employer/introduce', () => {
      expect(proxySource).toMatch(/'\/gioi-thieu':\s*['"]\/employer\/introduce['"]/);
      expect(proxySource).toMatch(/'\/introduce':\s*['"]\/employer\/introduce['"]/);
    });

    it('maps /dich-vu and /service to /employer/pricing', () => {
      expect(proxySource).toMatch(/'\/dich-vu':\s*['"]\/employer\/pricing['"]/);
      expect(proxySource).toMatch(/'\/service':\s*['"]\/employer\/pricing['"]/);
    });

    it('maps /bao-gia and /pricing to /employer/pricing', () => {
      expect(proxySource).toMatch(/'\/bao-gia':\s*['"]\/employer\/pricing['"]/);
      expect(proxySource).toMatch(/'\/pricing':\s*['"]\/employer\/pricing['"]/);
    });
  });

  describe('Runtime Proxy Rewrites on Employer Domain', () => {
    const testRewrite = (path: string, host = 'ntd.infohr.vn') => {
      const req = new NextRequest(`https://${host}${path}`, {
        headers: { host },
      });
      return proxy(req);
    };

    it('redirects employer.infohr.vn to ntd.infohr.vn via 301', () => {
      const res = testRewrite('/tin-tuyen-dung', 'employer.infohr.vn');
      expect(res.status).toBe(301);
      expect(res.headers.get('location')).toBe('https://ntd.infohr.vn/tin-tuyen-dung');
    });

    it('rewrites root / to /employer on ntd.infohr.vn', () => {
      const res = testRewrite('/');
      expect(res.headers.get('x-middleware-rewrite')).toContain('/employer');
      expect(res.headers.get('x-middleware-rewrite')).not.toContain('/employer/introduce');
    });

    it('rewrites root / to /employer on employer.localhost', () => {
      const res = testRewrite('/', 'employer.localhost');
      expect(res.headers.get('x-middleware-rewrite')).toContain('/employer');
      expect(res.headers.get('x-middleware-rewrite')).not.toContain('/employer/introduce');
    });

    it('rewrites /gioi-thieu and /introduce to /employer/introduce', () => {
      const resVi = testRewrite('/gioi-thieu');
      expect(resVi.headers.get('x-middleware-rewrite')).toContain('/employer/introduce');

      const resEn = testRewrite('/introduce');
      expect(resEn.headers.get('x-middleware-rewrite')).toContain('/employer/introduce');
    });

    it('rewrites /dich-vu and /service to /employer/pricing', () => {
      const resVi = testRewrite('/dich-vu');
      expect(resVi.headers.get('x-middleware-rewrite')).toContain('/employer/pricing');

      const resEn = testRewrite('/service');
      expect(resEn.headers.get('x-middleware-rewrite')).toContain('/employer/pricing');
    });

    it('rewrites /bao-gia and /pricing to /employer/pricing', () => {
      const resVi = testRewrite('/bao-gia');
      expect(resVi.headers.get('x-middleware-rewrite')).toContain('/employer/pricing');

      const resEn = testRewrite('/pricing');
      expect(resEn.headers.get('x-middleware-rewrite')).toContain('/employer/pricing');
    });

    it('redirects candidate routes on ntd.infohr.vn to main candidate portal', () => {
      const resPracticeVi = testRewrite('/luyen-phong-van');
      expect(resPracticeVi.status).toBe(302);
      expect(resPracticeVi.headers.get('location')).toBe('https://infohr.vn/luyen-phong-van');

      const resPracticeEn = testRewrite('/practice');
      expect(resPracticeEn.status).toBe(302);
      expect(resPracticeEn.headers.get('location')).toBe('https://infohr.vn/practice');

      const resCv = testRewrite('/tao-cv');
      expect(resCv.status).toBe(302);
      expect(resCv.headers.get('location')).toBe('https://infohr.vn/tao-cv');
    });

    it('redirects candidate routes on employer.localhost to localhost main portal', () => {
      const res = testRewrite('/luyen-phong-van', 'employer.localhost');
      expect(res.status).toBe(302);
      expect(res.headers.get('location')).toBe('http://localhost/luyen-phong-van');
    });
  });

  describe('Employer Service Page Redirect', () => {
    it('redirects to /employer/pricing when ServicePage is accessed directly', () => {
      expect(() => {
        EmployerServicePage();
      }).toThrow('NEXT_REDIRECT');

      expect(mockRedirect).toHaveBeenCalledWith('/employer/pricing');
    });
  });
});
