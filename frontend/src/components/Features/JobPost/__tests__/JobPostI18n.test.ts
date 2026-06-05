import fs from 'fs';
import path from 'path';

const componentPath = path.join(__dirname, '..', 'index.tsx');
const publicVi = require('../../../../i18n/locales/vi/public.json');
const publicEn = require('../../../../i18n/locales/en/public.json');
const commonVi = require('../../../../i18n/locales/vi/common.json');
const commonEn = require('../../../../i18n/locales/en/common.json');

describe('JobPost i18n', () => {
  it('uses locale key for time-left copy without a literal fallback', () => {
    const source = fs.readFileSync(componentPath, 'utf8');

    expect(source).not.toMatch(/jobPost\.timeLeft'[^)]*defaultValue/);
  });

  it('does not hard-code card aria-label or hot badge copy', () => {
    const source = fs.readFileSync(componentPath, 'utf8');

    expect(source).not.toContain('Job detail');
    expect(source).not.toContain('title="Hot"');
    expect(source).not.toMatch(/>\s*HOT\s*</);
    expect(source).toContain('common:viewDetails');
    expect(source).toContain('common:common.hot');
  });

  it('formats salary with the active language instead of fixed Vietnamese units', () => {
    const source = fs.readFileSync(componentPath, 'utf8');

    expect(source).not.toContain('salaryString(');
    expect(source).toContain('formatLocalizedSalaryRange');
    expect(source).toContain('i18n.language');
  });

  it('defines time-left copy in public locales', () => {
    expect(publicVi.jobPost.timeLeft).toBeTruthy();
    expect(publicEn.jobPost.timeLeft).toBeTruthy();
  });

  it('defines shared copy for card aria-label and hot badge', () => {
    expect(commonVi.viewDetails).toBeTruthy();
    expect(commonEn.viewDetails).toBeTruthy();
    expect(commonVi.common.hot).toBeTruthy();
    expect(commonEn.common.hot).toBeTruthy();
  });
});
