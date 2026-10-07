import { NextRequest } from 'next/server';
import { middleware } from '../../proxy';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Admin Subdomain Routing & Middleware Rewrites', () => {
  const middlewarePath = join(__dirname, '../../proxy.ts');
  const middlewareSource = readFileSync(middlewarePath, 'utf8');

  it('contains exact mappings for all reported 404 admin routes in ADMIN_EXACT_MAP', () => {
    // 1. Trợ lý AI AILA
    expect(middlewareSource).toContain("'/tro-ly-agent': '/admin/agent-assistants'");
    // 2. Cấu hình hệ thống
    expect(middlewareSource).toContain("'/cai-dat-he-thong': '/admin/settings'");
    // 3. Kết nối với nhà tuyển dụng
    expect(middlewareSource).toContain("'/ket-noi-voi-nha-tuyen-dung': '/admin/chat'");
    // 4. Nhật ký ứng tuyển sàn
    expect(middlewareSource).toContain("'/nhat-ky-tin-tuyen-dung': '/admin/job-activity'");
    expect(middlewareSource).toContain("'/job-activity': '/admin/job-activity'");
  });

  it('contains ADMIN_PREFIX_MAP for nested admin routes', () => {
    expect(middlewareSource).toContain('ADMIN_PREFIX_MAP');
    expect(middlewareSource).toContain("{ prefix: '/tin-tuc-blog', target: '/admin/articles' }");
    expect(middlewareSource).toContain("{ prefix: '/quan-ly-ho-so-ung-vien', target: '/admin/profiles' }");
    expect(middlewareSource).toContain("{ prefix: '/nhat-ky-tin-tuyen-dung', target: '/admin/job-activity' }");
  });

  describe('middleware rewrite behavior on admin.infohr.vn', () => {
    const createAdminRequest = (pathname: string) => {
      return new NextRequest(`https://admin.infohr.vn${pathname}`, {
        headers: { host: 'admin.infohr.vn' },
      });
    };

    it('rewrites /tro-ly-agent to /admin/agent-assistants', () => {
      const req = createAdminRequest('/tro-ly-agent');
      const res = middleware(req);
      const rewriteUrl = res.headers.get('x-middleware-rewrite');
      expect(rewriteUrl).toContain('/admin/agent-assistants');
    });

    it('rewrites /cai-dat-he-thong to /admin/settings', () => {
      const req = createAdminRequest('/cai-dat-he-thong');
      const res = middleware(req);
      const rewriteUrl = res.headers.get('x-middleware-rewrite');
      expect(rewriteUrl).toContain('/admin/settings');
    });

    it('rewrites /ket-noi-voi-nha-tuyen-dung to /admin/chat', () => {
      const req = createAdminRequest('/ket-noi-voi-nha-tuyen-dung');
      const res = middleware(req);
      const rewriteUrl = res.headers.get('x-middleware-rewrite');
      expect(rewriteUrl).toContain('/admin/chat');
    });

    it('rewrites /nhat-ky-tin-tuyen-dung to /admin/job-activity', () => {
      const req = createAdminRequest('/nhat-ky-tin-tuyen-dung');
      const res = middleware(req);
      const rewriteUrl = res.headers.get('x-middleware-rewrite');
      expect(rewriteUrl).toContain('/admin/job-activity');
    });

    it('rewrites /job-activity to /admin/job-activity', () => {
      const req = createAdminRequest('/job-activity');
      const res = middleware(req);
      const rewriteUrl = res.headers.get('x-middleware-rewrite');
      expect(rewriteUrl).toContain('/admin/job-activity');
    });

    it('redirects /quan-tri/cai-dat-he-thong to clean path /cai-dat-he-thong', () => {
      const req = createAdminRequest('/quan-tri/cai-dat-he-thong');
      const res = middleware(req);
      expect(res.status).toBe(301);
      expect(res.headers.get('location')).toBe('https://admin.infohr.vn/cai-dat-he-thong');
    });

    it('redirects /admin/tro-ly-agent to clean path /tro-ly-agent', () => {
      const req = createAdminRequest('/admin/tro-ly-agent');
      const res = middleware(req);
      expect(res.status).toBe(301);
      expect(res.headers.get('location')).toBe('https://admin.infohr.vn/tro-ly-agent');
    });

    it('rewrites nested article path /tin-tuc-blog/123 to /admin/articles/123', () => {
      const req = createAdminRequest('/tin-tuc-blog/123');
      const res = middleware(req);
      const rewriteUrl = res.headers.get('x-middleware-rewrite');
      expect(rewriteUrl).toContain('/admin/articles/123');
    });

    it('rewrites /tin-tuc-blog/tao-moi to /admin/articles/create', () => {
      const req = createAdminRequest('/tin-tuc-blog/tao-moi');
      const res = middleware(req);
      const rewriteUrl = res.headers.get('x-middleware-rewrite');
      expect(rewriteUrl).toContain('/admin/articles/create');
    });

    it('rewrites /jobs directly to /admin/jobs and does NOT redirect to candidate portal', () => {
      const req = createAdminRequest('/jobs');
      const res = middleware(req);
      expect(res.status).toBe(200);
      const rewriteUrl = res.headers.get('x-middleware-rewrite');
      expect(rewriteUrl).toContain('/admin/jobs');
    });

    it('rewrites /quan-ly-tin-tuyen-dung directly to /admin/jobs', () => {
      const req = createAdminRequest('/quan-ly-tin-tuyen-dung');
      const res = middleware(req);
      expect(res.status).toBe(200);
      const rewriteUrl = res.headers.get('x-middleware-rewrite');
      expect(rewriteUrl).toContain('/admin/jobs');
    });
  });
});
