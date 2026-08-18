import { readFileSync } from 'fs';
import { join } from 'path';

describe('JobSeeker AttachedProfilePage Navigation & Sections', () => {
  const filePath = join(__dirname, '../AttachedProfilePage/index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('renders PersonalInfo, GeneralInfo, and CVCard attached resume upload sections', () => {
    expect(source).toContain('<PersonalInfoCard');
    expect(source).toContain('<GeneralInfoCard');
    expect(source).toContain('<CVCard');
  });

  it('provides quick-jump scrolling with IntersectionObserver synchronization', () => {
    expect(source).toContain('IntersectionObserver');
    expect(source).toContain('handleClickScroll');
    expect(source).toContain('scrollIntoView');
  });
});
