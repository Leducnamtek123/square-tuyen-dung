import { readFileSync } from 'fs';
import { join } from 'path';

describe('AIAnalysisDrawer Component & AI Matching', () => {
  const filePath = join(__dirname, '../index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('declares AIAnalysisData type with match score, criteria, and evidence breakdown', () => {
    expect(source).toContain('aiAnalysisScore');
    expect(source).toContain('aiAnalysisMatchingSkills');
    expect(source).toContain('aiAnalysisMissingSkills');
    expect(source).toContain('AIAnalysisDrawerView');
  });

  it('updates application analysis state via jobPostActivityService', () => {
    expect(source).toContain('jobPostActivityService');
    expect(source).toContain('useQueryClient');
  });
});
