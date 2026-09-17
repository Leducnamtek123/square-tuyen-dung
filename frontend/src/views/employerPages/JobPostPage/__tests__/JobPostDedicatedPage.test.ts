import { ROUTES, generateRewrites } from '@/configs/routeConfig';
import { localizeRoutePath } from '@/configs/routeLocalization';
import viEmployer from '@/i18n/locales/vi/employer.json';

describe('JobPost Dedicated Page Architecture and Route Verification', () => {
  it('defines canonical routes for create and edit job posts in ROUTES.EMPLOYER', () => {
    expect(ROUTES.EMPLOYER.JOB_POST).toBe('employer/job-posts');
    expect(ROUTES.EMPLOYER.JOB_POST_CREATE).toBe('employer/job-posts/create');
    expect(ROUTES.EMPLOYER.JOB_POST_EDIT).toBe('employer/job-posts/:id/edit');
  });

  it('correctly rewrites localized Vietnamese paths to Next.js page paths', () => {
    const rewrites = generateRewrites();
    
    const createRewrite = rewrites.find(
      (r) => r.source === '/nha-tuyen-dung/tin-tuyen-dung/tao-moi'
    );
    expect(createRewrite).toBeDefined();
    expect(createRewrite?.destination).toBe('/employer/job-posts/create');

    const editRewrite = rewrites.find(
      (r) => r.source === '/nha-tuyen-dung/tin-tuyen-dung/:id/chinh-sua'
    );
    expect(editRewrite).toBeDefined();
    expect(editRewrite?.destination).toBe('/employer/job-posts/:id/edit');
  });

  it('localizes routes correctly between English and Vietnamese', () => {
    const viCreatePath = localizeRoutePath('/' + ROUTES.EMPLOYER.JOB_POST_CREATE, 'vi');
    expect(viCreatePath).toBe('/nha-tuyen-dung/tin-tuyen-dung/tao-moi');

    const viEditPath = localizeRoutePath('/employer/job-posts/99/edit', 'vi');
    expect(viEditPath).toBe('/nha-tuyen-dung/tin-tuyen-dung/99/chinh-sua');
  });

  it('ensures all Vietnamese strings in jobPost.editor do NOT contain parentheses', () => {
    const editorStrings = (viEmployer as any)?.jobPost?.editor || {};
    expect(Object.keys(editorStrings).length).toBeGreaterThan(0);

    const checkNoParentheses = (obj: Record<string, any>, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          const hasLeftParen = value.includes('(');
          const hasRightParen = value.includes(')');
          if (hasLeftParen || hasRightParen) {
            throw new Error(`Forbidden parentheses found in key "${prefix}${key}": "${value}"`);
          }
        } else if (typeof value === 'object' && value !== null) {
          checkNoParentheses(value, `${prefix}${key}.`);
        }
      }
    };

    expect(() => checkNoParentheses(editorStrings)).not.toThrow();
  });
});
