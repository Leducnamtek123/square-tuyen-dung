import { readFileSync } from 'fs';
import { join } from 'path';

const chartFiles = [
  '../RecruitmentChart/index.tsx',
  '../ApplicationChart/index.tsx',
  '../CandidateChart/index.tsx',
  '../HiringAcademicChart/index.tsx',
];

describe('dashboard charts i18n', () => {
  it('does not hard-code fallback copy for fixed chart loading labels', () => {
    chartFiles.forEach((file) => {
      const source = readFileSync(join(__dirname, file), 'utf8');

      expect(source).not.toMatch(/t\('[^']+Chart\.loading'\s*,\s*\{\s*defaultValue:/);
    });
  });

  it('keeps hiring academic labels aligned with the chart label normalizer', () => {
    const viEmployer = JSON.parse(
      readFileSync(join(__dirname, '../../../../../i18n/locales/vi/employer.json'), 'utf8'),
    );
    const enEmployer = JSON.parse(
      readFileSync(join(__dirname, '../../../../../i18n/locales/en/employer.json'), 'utf8'),
    );

    expect(viEmployer.hiringAcademicChart.labels).toHaveProperty('vocationalintermediate');
    expect(enEmployer.hiringAcademicChart.labels).toHaveProperty('vocationalintermediate');
  });
});
