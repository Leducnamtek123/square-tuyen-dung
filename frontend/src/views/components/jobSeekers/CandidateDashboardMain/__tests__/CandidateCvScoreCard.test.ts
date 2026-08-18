import { readFileSync } from 'fs';
import { join } from 'path';

describe('CandidateCvScoreCard Component & Calculation', () => {
  const filePath = join(__dirname, '../CandidateCvScoreCard.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('calculates progress percentage capped at 100%', () => {
    expect(source).toContain('progressValue = viewedCount > 0 ? Math.min(viewedCount * 20, 100) : 0');
  });

  it('links to localized candidate profile path', () => {
    expect(source).toContain("localizeRoutePath('/profile', i18n.language)");
  });

  it('uses candidateDashboard.cvHealth localization keys', () => {
    expect(source).toContain('candidateDashboard.cvHealth.title');
    expect(source).toContain('candidateDashboard.cvHealth.subtitle');
    expect(source).toContain('candidateDashboard.cvHealth.description');
    expect(source).toContain('candidateDashboard.cvHealth.optimizeButton');
  });
});
