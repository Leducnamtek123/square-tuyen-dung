import { readFileSync } from 'fs';
import { join } from 'path';

const newsPageSource = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
const articleDetailSource = readFileSync(join(__dirname, '../ArticleDetailPage.tsx'), 'utf8');

describe('News page localized routes', () => {
  it('localizes article list links and news page CTAs', () => {
    expect(newsPageSource).toContain('localizeRoutePath');
    expect(newsPageSource).toContain('i18n.language');
    expect(newsPageSource).toContain('formatRoute(ROUTES.JOB_SEEKER.NEWS_DETAIL');

    expect(newsPageSource).not.toContain('const href = `/${ROUTES.JOB_SEEKER.NEWS}/${article.slug}`');
    expect(newsPageSource).not.toContain('href={`/${ROUTES.JOB_SEEKER.NEWS}`}');
    expect(newsPageSource).not.toContain('href={`/${ROUTES.JOB_SEEKER.JOBS}`}');
    expect(newsPageSource).not.toContain("${typeof window !== 'undefined' ? window.location.origin : ''}/${ROUTES.JOB_SEEKER.NEWS}");
  });

  it('localizes article detail back links and canonical URLs', () => {
    expect(articleDetailSource).toContain('localizeRoutePath');
    expect(articleDetailSource).toContain('i18n.language');
    expect(articleDetailSource).toContain('formatRoute(ROUTES.JOB_SEEKER.NEWS_DETAIL');

    expect(articleDetailSource).not.toContain('push(`/${ROUTES.JOB_SEEKER.NEWS}`)');
    expect(articleDetailSource).not.toContain('href={`/${ROUTES.JOB_SEEKER.NEWS}`}');
    expect(articleDetailSource).not.toContain("${typeof window !== 'undefined' ? window.location.origin : ''}/${ROUTES.JOB_SEEKER.NEWS}");
    expect(articleDetailSource).not.toContain("${typeof window !== 'undefined' ? window.location.origin : ''}/${ROUTES.JOB_SEEKER.NEWS}/${slug}");
  });
});
