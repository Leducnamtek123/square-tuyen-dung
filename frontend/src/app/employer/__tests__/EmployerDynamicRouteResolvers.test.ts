import { resolveEmployerPath, resolveAdminPath, middleware } from '@/proxy';
import { NextRequest } from 'next/server';

describe('Employer and Admin Dynamic Route Resolvers', () => {
  describe('resolveEmployerPath', () => {
    it('correctly rewrites job post edit paths with Vietnamese and English action suffixes', () => {
      expect(resolveEmployerPath('/tin-tuyen-dung/kien-truc-su-thiet-ke-noi-that-khong-gian/chinh-sua')).toBe(
        '/employer/job-posts/kien-truc-su-thiet-ke-noi-that-khong-gian/edit'
      );
      expect(resolveEmployerPath('/tin-tuyen-dung/123/sua')).toBe('/employer/job-posts/123/edit');
      expect(resolveEmployerPath('/tin-tuyen-dung/123/edit')).toBe('/employer/job-posts/123/edit');
      expect(resolveEmployerPath('/job-posts/kien-truc-su/chinh-sua')).toBe(
        '/employer/job-posts/kien-truc-su/edit'
      );
      expect(resolveEmployerPath('/job-posts/123/edit')).toBe('/employer/job-posts/123/edit');
    });

    it('correctly rewrites job post create and detail paths', () => {
      expect(resolveEmployerPath('/tin-tuyen-dung/tao-moi')).toBe('/employer/job-posts/create');
      expect(resolveEmployerPath('/tin-tuyen-dung/create')).toBe('/employer/job-posts/create');
      expect(resolveEmployerPath('/job-posts/create')).toBe('/employer/job-posts/create');
      expect(resolveEmployerPath('/job-posts/tao-moi')).toBe('/employer/job-posts/create');
      expect(resolveEmployerPath('/tin-tuyen-dung/kien-truc-su-thiet-ke-noi-that-khong-gian')).toBe(
        '/employer/job-posts/kien-truc-su-thiet-ke-noi-that-khong-gian'
      );
      expect(resolveEmployerPath('/job-posts/456')).toBe('/employer/job-posts/456');
    });

    it('correctly rewrites interview edit, create, session, and detail paths', () => {
      expect(resolveEmployerPath('/danh-sach-phong-van/789/chinh-sua')).toBe(
        '/employer/interviews/789/edit'
      );
      expect(resolveEmployerPath('/danh-sach-phong-van/789/sua')).toBe('/employer/interviews/789/edit');
      expect(resolveEmployerPath('/danh-sach-phong-van/789/edit')).toBe('/employer/interviews/789/edit');
      expect(resolveEmployerPath('/sua-lich-phong-van/789')).toBe('/employer/interviews/789/edit');
      expect(resolveEmployerPath('/interviews/789/edit')).toBe('/employer/interviews/789/edit');

      expect(resolveEmployerPath('/danh-sach-phong-van/tao-moi')).toBe('/employer/interviews/create');
      expect(resolveEmployerPath('/danh-sach-phong-van/create')).toBe('/employer/interviews/create');
      expect(resolveEmployerPath('/len-lich-phong-van')).toBe('/employer/interviews/create');
      expect(resolveEmployerPath('/interviews/create')).toBe('/employer/interviews/create');

      expect(resolveEmployerPath('/danh-sach-phong-van/session/sess-123')).toBe(
        '/employer/interviews/session/sess-123'
      );
      expect(resolveEmployerPath('/interviews/session/sess-123')).toBe(
        '/employer/interviews/session/sess-123'
      );

      expect(resolveEmployerPath('/danh-sach-phong-van/789')).toBe('/employer/interviews/789');
      expect(resolveEmployerPath('/chi-tiet-phong-van/789')).toBe('/employer/interviews/789');
      expect(resolveEmployerPath('/phong-van-truc-tiep/789')).toBe('/employer/interviews/789');
      expect(resolveEmployerPath('/interviews/789')).toBe('/employer/interviews/789');
    });

    it('correctly rewrites candidate profile detail paths', () => {
      expect(resolveEmployerPath('/danh-sach-ung-vien/nguyen-van-a')).toBe(
        '/employer/candidates/nguyen-van-a'
      );
      expect(resolveEmployerPath('/tim-ung-vien/nguyen-van-a')).toBe('/employer/candidates/nguyen-van-a');
      expect(resolveEmployerPath('/chi-tiet-ung-vien/nguyen-van-a')).toBe(
        '/employer/candidates/nguyen-van-a'
      );
      expect(resolveEmployerPath('/candidates/nguyen-van-a')).toBe('/employer/candidates/nguyen-van-a');
      expect(resolveEmployerPath('/resumes/nguyen-van-a')).toBe('/employer/candidates/nguyen-van-a');
    });

    it('correctly rewrites blog paths', () => {
      expect(resolveEmployerPath('/blog-tuyen-dung')).toBe('/employer/blog');
      expect(resolveEmployerPath('/blog-tuyen-dung/tao-moi')).toBe('/employer/blog/create');
      expect(resolveEmployerPath('/blog-tuyen-dung/create')).toBe('/employer/blog/create');
      expect(resolveEmployerPath('/blog-tuyen-dung/bai-viet-hay/chinh-sua')).toBe(
        '/employer/blog/bai-viet-hay'
      );
      expect(resolveEmployerPath('/blog-tuyen-dung/bai-viet-hay')).toBe('/employer/blog/bai-viet-hay');
    });

    it('correctly rewrites HRM subpaths', () => {
      expect(resolveEmployerPath('/hrm/cham-cong/bao-cao')).toBe('/employer/hrm/attendances/reports');
      expect(resolveEmployerPath('/hrm/cham-cong/thiet-bi')).toBe('/employer/hrm/attendances/devices');
      expect(resolveEmployerPath('/hrm/cham-cong/thiet-lap')).toBe('/employer/hrm/attendances/settings');
      expect(resolveEmployerPath('/hrm/cham-cong/chi-tiet')).toBe('/employer/hrm/attendances/timesheets');
      expect(resolveEmployerPath('/hrm/cham-cong/tong-hop')).toBe(
        '/employer/hrm/attendances/monthly-summary'
      );
      expect(resolveEmployerPath('/hrm/ca-lam-viec')).toBe('/employer/hrm/attendances/shifts');
      expect(resolveEmployerPath('/hrm/phan-ca')).toBe('/employer/hrm/attendances/shift-assignments');
      expect(resolveEmployerPath('/hrm/quan-ly-don')).toBe('/employer/hrm/attendances/requests');
      expect(resolveEmployerPath('/hrm/may-cham-cong')).toBe('/employer/hrm/attendances/biometric-logs');
      expect(resolveEmployerPath('/hrm/cham-cong')).toBe('/employer/hrm/attendances');
      expect(resolveEmployerPath('/hrm/ho-so-nhan-vien')).toBe('/employer/hrm/employees');
      expect(resolveEmployerPath('/hrm/nhan-su-va-vai-tro')).toBe('/employer/hrm/employees');
      expect(resolveEmployerPath('/hrm/tiep-nhan')).toBe('/employer/hrm/onboarding');
      expect(resolveEmployerPath('/hrm/phong-ban')).toBe('/employer/hrm/departments');
      expect(resolveEmployerPath('/hrm/hop-dong')).toBe('/employer/hrm/contracts');
      expect(resolveEmployerPath('/hrm/nghi-phep')).toBe('/employer/hrm/leaves');
      expect(resolveEmployerPath('/hrm/bang-luong')).toBe('/employer/hrm/payroll');
      expect(resolveEmployerPath('/hrm/so-do-to-chuc')).toBe('/employer/hrm/org-chart');
      expect(resolveEmployerPath('/hrm/bang-dieu-khien')).toBe('/employer/hrm/dashboard');
    });
  });

  describe('resolveAdminPath', () => {
    it('correctly rewrites numeric profile IDs', () => {
      expect(resolveAdminPath('/123')).toBe('/admin/profiles/123');
      expect(resolveAdminPath('/9999')).toBe('/admin/profiles/9999');
    });

    it('correctly rewrites article routes', () => {
      expect(resolveAdminPath('/tin-tuc-blog/tao-moi')).toBe('/admin/articles/create');
      expect(resolveAdminPath('/articles/create')).toBe('/admin/articles/create');
      expect(resolveAdminPath('/tin-tuc-blog/55/chinh-sua')).toBe('/admin/articles/55');
      expect(resolveAdminPath('/tin-tuc-blog/55/edit')).toBe('/admin/articles/55');
      expect(resolveAdminPath('/articles/55/edit')).toBe('/admin/articles/55');
      expect(resolveAdminPath('/tin-tuc-blog/55')).toBe('/admin/articles/55');
    });

    it('correctly rewrites profile routes', () => {
      expect(resolveAdminPath('/quan-ly-ho-so-ung-vien/77')).toBe('/admin/profiles/77');
      expect(resolveAdminPath('/ho-so-ung-vien/77')).toBe('/admin/profiles/77');
      expect(resolveAdminPath('/ho-so/77')).toBe('/admin/profiles/77');
      expect(resolveAdminPath('/profiles/77')).toBe('/admin/profiles/77');
    });

    it('correctly rewrites exact admin routes including job notifications', () => {
      expect(resolveAdminPath('/thong-bao-viec-lam')).toBe('/admin/job-notifications');
      expect(resolveAdminPath('/job-notifications')).toBe('/admin/job-notifications');
      expect(resolveAdminPath('/quan-ly-nguoi-dung')).toBe('/admin/users');
      expect(resolveAdminPath('/quan-ly-tin-tuyen-dung')).toBe('/admin/jobs');
      expect(resolveAdminPath('/quan-ly-cong-ty')).toBe('/admin/companies');
      expect(resolveAdminPath('/bang-dieu-khien')).toBe('/admin/dashboard');
    });
  });

  describe('Runtime Middleware integration', () => {
    const testRewrite = (path: string, host = 'ntd.infohr.vn') => {
      const req = new NextRequest(`https://${host}${path}`, {
        headers: { host },
      });
      return middleware(req);
    };

    it('rewrites the user reported 404 URL correctly on employer domain', () => {
      const res = testRewrite('/tin-tuyen-dung/kien-truc-su-thiet-ke-noi-that-khong-gian/chinh-sua');
      expect(res.headers.get('x-middleware-rewrite')).toContain(
        '/employer/job-posts/kien-truc-su-thiet-ke-noi-that-khong-gian/edit'
      );
    });

    it('rewrites direct job post view on employer domain', () => {
      const res = testRewrite('/tin-tuyen-dung/kien-truc-su-thiet-ke-noi-that-khong-gian');
      expect(res.headers.get('x-middleware-rewrite')).toContain(
        '/employer/job-posts/kien-truc-su-thiet-ke-noi-that-khong-gian'
      );
    });

    it('rewrites interview edit on employer domain', () => {
      const res = testRewrite('/danh-sach-phong-van/100/chinh-sua');
      expect(res.headers.get('x-middleware-rewrite')).toContain('/employer/interviews/100/edit');
    });

    it('rewrites admin job notifications on admin domain', () => {
      const res = testRewrite('/thong-bao-viec-lam', 'admin.infohr.vn');
      expect(res.headers.get('x-middleware-rewrite')).toContain('/admin/job-notifications');
    });
  });
});
