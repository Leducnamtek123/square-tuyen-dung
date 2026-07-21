import { readFileSync } from 'fs';
import { join } from 'path';

const salaryDisplayFiles = [
  ['components/Features/JobSeekerProfile/index.tsx', 'formatLocalizedSalaryRange'],
  ['components/Features/CVDoc/CVDocInfoSection.tsx', 'formatLocalizedSalaryRange'],
  ['views/components/jobSeekers/BoxProfile/index.tsx', 'formatLocalizedSalaryRange'],
  ['views/components/jobSeekers/GeneralInfoCard/GeneralInfoCardContent.tsx', 'formatLocalizedSalaryRange'],
  ['views/components/jobSeekers/GeneralInfoCard/index.tsx', 'salaryLanguage={i18n.language}'],
  ['views/components/employers/SavedResumeTable/index.tsx', 'formatLocalizedSalaryRange'],
  ['views/components/employers/ProfileDetailCard/GeneralInfoSection.tsx', 'formatLocalizedSalaryRange'],
  ['views/components/employers/ProfileDetailCard/index.tsx', 'formatLocalizedSalaryRange'],
];

describe('authenticated salary display formatting', () => {
  it('uses locale-aware salary range formatting instead of fixed Vietnamese units', () => {
    for (const [relativePath, expectedToken] of salaryDisplayFiles) {
      const source = readFileSync(join(__dirname, '..', '..', relativePath), 'utf8');

      expect(source).not.toContain('salaryString(');
      expect(source).toContain(expectedToken);
    }
  });
});
