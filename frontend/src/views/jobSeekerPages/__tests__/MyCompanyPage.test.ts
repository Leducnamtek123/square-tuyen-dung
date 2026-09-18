import { readFileSync } from 'fs';
import { join } from 'path';

describe('JobSeeker MyCompanyPage Tabs & Navigation', () => {
  const filePath = join(__dirname, '../MyCompanyPage/index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('manages tabs for viewed companies and followed companies', () => {
    expect(source).toContain('TabContext');
    expect(source).toContain('<CompanyViewedCard');
    expect(source).toContain('<CompanyFollowedCard');
    expect(source).toContain('<SuggestedJobPostCard');
  });

  it('uses i18n keys for tab labels and aria accessibility', () => {
    expect(source).toContain('myCompany.tabs.viewed');
    expect(source).toContain('myCompany.tabs.followed');
    expect(source).toContain('myCompany.aria.tabs');
  });
});
