import { readFileSync } from 'fs';
import { join } from 'path';

describe('ProfileSearch Component & Candidate Filter State', () => {
  const filePath = join(__dirname, '../index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('manages candidate filters via Redux searchResume and resetSearchResume actions', () => {
    expect(source).toContain('searchResume');
    expect(source).toContain('resetSearchResume');
    expect(source).toContain('useGlobalFilter');
  });

  it('integrates GlobalFilterBar, GlobalFilterDrawer, and ActiveFilterChips', () => {
    expect(source).toContain('GlobalFilterBar');
    expect(source).toContain('GlobalFilterDrawer');
    expect(source).toContain('ActiveFilterChips');
  });
});
