import { readFileSync } from 'fs';
import { join } from 'path';

const topCompanySource = readFileSync(
  join(__dirname, '../TopCompanyCarousel/index.tsx'),
  'utf8'
);
const companyInfoSectionSource = readFileSync(
  join(__dirname, '../Company/CompanyInfoSection.tsx'),
  'utf8'
);
const companyHeaderSource = readFileSync(
  join(__dirname, '../../../views/defaultPages/CompanyDetailPage/CompanyHeader.tsx'),
  'utf8'
);
const jobDetailSidebarSource = readFileSync(
  join(__dirname, '../../../views/defaultPages/JobDetailPage/components/JobDetailSidebar.tsx'),
  'utf8'
);

describe('company data sourcing', () => {
  it('uses api-backed fields on the homepage top companies section', () => {
    expect(topCompanySource).not.toContain('Math.random()');
    expect(topCompanySource).toContain('jobPostNumber');
    expect(topCompanySource).toContain('employeeSizeDict');
    expect(topCompanySource).not.toContain('jobPostsCount');
    expect(topCompanySource).not.toContain('employeeSizeRange');
  });

  it('uses config-backed employee-size rendering on company views', () => {
    expect(companyInfoSectionSource).toContain('employeeSizeDict');
    expect(companyHeaderSource).toContain('employeeSizeDict');
    expect(jobDetailSidebarSource).toContain('employeeSizeDict');
  });

  it('does not hardcode employee-size labels in the job detail sidebar', () => {
    expect(jobDetailSidebarSource).not.toContain('Trên 300 nhân viên');
    expect(jobDetailSidebarSource).not.toContain('Dưới 10 nhân viên');
  });
});
