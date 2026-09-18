import { readFileSync } from 'fs';
import { join } from 'path';

describe('JobSeeker OnlineProfilePage Navigation & Sections', () => {
  const filePath = join(__dirname, '../OnlineProfilePage/index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('implements 7 distinct candidate profile sections with unique component cards', () => {
    expect(source).toContain('<PersonalInfoCard');
    expect(source).toContain('<GeneralInfoCard');
    expect(source).toContain('<ExperienceDetailCard');
    expect(source).toContain('<EducationDetailCard');
    expect(source).toContain('<CertificateCard');
    expect(source).toContain('<LanguageSkillCard');
    expect(source).toContain('<AdvancedSkillCard');
  });

  it('features IntersectionObserver for interactive sidebar spy navigation', () => {
    expect(source).toContain('IntersectionObserver');
    expect(source).toContain('observer.observe');
    expect(source).toContain('setActiveSection');
    expect(source).toContain('scrollIntoView');
  });

  it('guards against accidental page exit with usePreventUnsavedChanges', () => {
    expect(source).toContain('usePreventUnsavedChanges');
  });
});
