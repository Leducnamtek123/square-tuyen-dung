import { readFileSync } from 'fs';
import { join } from 'path';

const readSource = (...segments: string[]) => readFileSync(join(__dirname, ...segments), 'utf8');

describe('candidate profile salary fields', () => {
  it('renders only the desired salary range in candidate profile forms', () => {
    const fieldSources = [
      readSource('../GeneralInfoFormFields.tsx'),
      readSource('../../ProfileUploadForm/ProfileUploadFormFields.tsx'),
    ];

    for (const source of fieldSources) {
      expect(source).toContain('name="salaryMin"');
      expect(source).toContain('name="salaryMax"');
      expect(source).not.toContain('name="expectedSalary"');
      expect(source).not.toContain('profile.fields.expectedSalary');
    }
  });

  it('does not show a separate expected salary row in candidate profile details', () => {
    const source = readSource('../../GeneralInfoCard/GeneralInfoCardContent.tsx');

    expect(source).toContain('profile.fields.desiredSalary');
    expect(source).not.toContain('profile.fields.expectedSalary');
    expect(source).not.toContain('resumeDetail.expectedSalary');
  });
});
