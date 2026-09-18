import { readFileSync } from 'fs';
import { join } from 'path';

describe('Employer ProfileAppliedPage Component & Applications View', () => {
  const filePath = join(__dirname, '../ProfileAppliedPage/index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('renders AppliedResumeCard with translated title', () => {
    expect(source).toContain('<AppliedResumeCard title={t(\'appliedResume.title\')} />');
    expect(source).toContain("TabTitle(t('appliedResume.title'))");
  });
});
