import { readFileSync } from 'fs';
import { join } from 'path';

const readFeature = (relativePath: string) => readFileSync(join(__dirname, '..', relativePath), 'utf8');
const readView = (relativePath: string) => readFileSync(join(__dirname, '../../../views', relativePath), 'utf8');

describe('public job and company detail links', () => {
  it.each([
    ['JobPostAction/index.tsx', 'ROUTES.JOB_SEEKER.JOB_DETAIL'],
    ['JobSalaryInsightCard/index.tsx', 'ROUTES.JOB_SEEKER.JOB_DETAIL'],
    ['CompanyAction/index.tsx', 'ROUTES.JOB_SEEKER.COMPANY_DETAIL'],
    ['CompanyAction/CompanyActionFollow.tsx', 'ROUTES.JOB_SEEKER.COMPANY_DETAIL'],
  ])('%s localizes public detail routes', (relativePath, routeConstant) => {
    const source = readFeature(relativePath);

    expect(source).toContain('localizeRoutePath');
    expect(source).toContain(routeConstant);
    expect(source).not.toContain('const detailHref = `/${formatRoute(ROUTES.JOB_SEEKER');
    expect(source).not.toContain('href={`/${formatRoute(ROUTES.JOB_SEEKER');
    expect(source).not.toContain('? `/${formatRoute(ROUTES.JOB_SEEKER');
    expect(source).not.toContain(": '#';");
  });

  it('localizes the company link in the job detail header', () => {
    const source = readView('defaultPages/JobDetailPage/components/JobDetailHeaderCard.tsx');

    expect(source).toContain('localizeRoutePath');
    expect(source).toContain('ROUTES.JOB_SEEKER.COMPANY_DETAIL');
    expect(source).not.toContain("href={`/${formatRoute(ROUTES.JOB_SEEKER.COMPANY_DETAIL");
    expect(source).not.toContain("slug || ''");
  });
});
