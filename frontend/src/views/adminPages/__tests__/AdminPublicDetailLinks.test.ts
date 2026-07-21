import { readFileSync } from 'fs';
import { join } from 'path';

describe('admin public detail links', () => {
  it('uses localized public job detail routes from the route config', () => {
    const source = readFileSync(join(__dirname, '../JobsPage/index.tsx'), 'utf8');

    expect(source).not.toContain('href={`/jobs/${job.slug}`}');
    expect(source).toContain('localizeRoutePath');
    expect(source).toContain('formatRoute');
    expect(source).toContain('ROUTES.JOB_SEEKER.JOB_DETAIL');
    expect(source).toContain('i18n.language');
  });

  it('uses localized public company detail routes from the route config', () => {
    const source = readFileSync(join(__dirname, '../CompaniesPage/index.tsx'), 'utf8');

    expect(source).not.toContain('href={`/companies/${info.row.original.slug}`}');
    expect(source).toContain('localizeRoutePath');
    expect(source).toContain('formatRoute');
    expect(source).toContain('ROUTES.JOB_SEEKER.COMPANY_DETAIL');
    expect(source).toContain('i18n.language');
  });
});
