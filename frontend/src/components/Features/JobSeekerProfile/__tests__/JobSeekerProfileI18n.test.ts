import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
const employerVi = require('../../../../i18n/locales/vi/employer.json');
const employerEn = require('../../../../i18n/locales/en/employer.json');

describe('JobSeekerProfile i18n', () => {
  it('passes date values to date-interpolated employer profile labels', () => {
    expect(employerVi.profileCard.label.lastViewed).toContain('{{date}}');
    expect(employerEn.profileCard.label.lastViewed).toContain('{{date}}');
    expect(employerVi.profileCard.label.updatedAt).toContain('{{date}}');
    expect(employerEn.profileCard.label.updatedAt).toContain('{{date}}');

    expect(source).toMatch(/t\('employer:profileCard\.label\.lastViewed'\s*,\s*\{[\s\S]*date:/);
    expect(source).toMatch(/t\('employer:profileCard\.label\.updatedAt'\s*,\s*\{[\s\S]*date:/);
    expect(source).not.toContain("t('employer:profileCard.label.lastViewed')}:");
    expect(source).not.toContain("t('employer:profileCard.label.updatedAt')}:");
  });
});
