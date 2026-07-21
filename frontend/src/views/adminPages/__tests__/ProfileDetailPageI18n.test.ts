import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = readFileSync(join(__dirname, '../ProfileDetailPage/index.tsx'), 'utf8');

describe('ProfileDetailPage i18n and routing', () => {
  it('uses the profile detail namespace for all visible labels', () => {
    expect(source).toContain("pages.profileDetail.title");
    expect(source).toContain("pages.profileDetail.subtitle");
    expect(source).toContain("pages.profileDetail.sections.summary");
    expect(source).toContain("pages.profileDetail.sections.contact");
    expect(source).toContain("pages.profileDetail.sections.details");
    expect(source).toContain("pages.profileDetail.sections.resumes");
  });

  it('does not use the legacy profileDetail namespace without pages prefix', () => {
    expect(source).not.toContain("t('profileDetail.");
  });
});
