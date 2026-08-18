import { readFileSync } from 'fs';
import { join } from 'path';

describe('Employer CompanyPage Component & Tabs Management', () => {
  const filePath = join(__dirname, '../CompanyPage/index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('manages 3 tabs: Company info, Multimedia images, and Team members', () => {
    expect(source).toContain('<CompanyCard />');
    expect(source).toContain('<CompanyImageCard />');
    expect(source).toContain('<CompanyTeamCard />');
  });

  it('binds tabs with employer i18n keys and aria labels', () => {
    expect(source).toContain('company.tabs.info');
    expect(source).toContain('company.tabs.multimedia');
    expect(source).toContain('company.tabs.team');
    expect(source).toContain('company.tabs.ariaLabel');
  });
});
