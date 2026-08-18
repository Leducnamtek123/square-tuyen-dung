import { readFileSync } from 'fs';
import { join } from 'path';

describe('Employer SavedProfilePage Component & Talent Pool', () => {
  const filePath = join(__dirname, '../SavedProfilePage/index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('renders SavedResumeCard with localized title', () => {
    expect(source).toContain('<SavedResumeCard title={t(\'savedResume.title\')} />');
    expect(source).toContain("TabTitle(t('savedResume.title'))");
  });
});
