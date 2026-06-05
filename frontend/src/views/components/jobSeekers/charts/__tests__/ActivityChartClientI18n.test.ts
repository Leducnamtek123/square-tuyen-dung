import fs from 'fs';
import path from 'path';

const componentPath = path.join(__dirname, '..', 'ActivityChartClient.tsx');
const jobSeekerVi = require('../../../../../i18n/locales/vi/jobSeeker.json');
const jobSeekerEn = require('../../../../../i18n/locales/en/jobSeeker.json');

describe('ActivityChartClient i18n', () => {
  it('uses locale key for loading copy without a literal fallback', () => {
    const source = fs.readFileSync(componentPath, 'utf8');

    expect(source).not.toContain("'Loading chart'");
    expect(source).not.toMatch(/activityChart\.loading'[^)]*defaultValue/);
  });

  it('defines loading copy in job seeker locales', () => {
    expect(jobSeekerVi.activityChart.loading).toBeTruthy();
    expect(jobSeekerEn.activityChart.loading).toBeTruthy();
  });
});
