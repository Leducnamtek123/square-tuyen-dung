import { readFileSync } from 'fs';
import { join } from 'path';
import { createEmployerSignUpSchema } from '../index';

const t = (key: string, defaultValue?: string) => {
  const translations: Record<string, string> = {
    'validation.foundedDateInFuture': 'Founded date cannot be in the future.',
    'validation.employeeSizeInvalid': 'Invalid company size.',
    'common:validation.invalidUrl': 'Please enter a valid URL.',
  };

  return translations[key] || defaultValue || key;
};

describe('createEmployerSignUpSchema', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('rejects future company founded dates', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 4, 12, 0, 0).getTime());
    const schema = createEmployerSignUpSchema(t as never);
    const tomorrow = new Date(2026, 5, 5, 0, 0, 0);

    await expect(schema.validateAt('company.since', { company: { since: tomorrow } })).rejects.toThrow(
      'Founded date cannot be in the future.',
    );
  });

  it('rejects employee size outside backend choices', async () => {
    const schema = createEmployerSignUpSchema(t as never);

    await expect(schema.validateAt('company.employeeSize', { company: { employeeSize: 999 } })).rejects.toThrow(
      'Invalid company size.',
    );
  });

  it('rejects invalid company website URLs but allows blank values', async () => {
    const schema = createEmployerSignUpSchema(t as never);

    await expect(schema.validateAt('company.websiteUrl', { company: { websiteUrl: 'not-a-url' } })).rejects.toThrow(
      'Please enter a valid URL.',
    );
    await expect(schema.validateAt('company.websiteUrl', { company: { websiteUrl: '' } })).resolves.toBeNull();
  });

  it('keeps the founded date picker aligned with schema validation', () => {
    const fieldsSource = readFileSync(join(__dirname, '../CompanyInfoStep.tsx'), 'utf8');

    expect(fieldsSource).toContain('name="company.since"');
    expect(fieldsSource).toContain('maxDate={DATE_OPTIONS.today()}');
  });

  it('uses auth locale keys for district field labels without wrong ward fallbacks', () => {
    const fieldsSource = readFileSync(join(__dirname, '../CompanyInfoStep.tsx'), 'utf8');
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../../i18n/locales/vi/auth.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../../i18n/locales/en/auth.json'), 'utf8'));

    expect(fieldsSource).toContain("title={t('form.district')}");
    expect(fieldsSource).toContain("placeholder={t('form.districtPlaceholder')}");
    expect(fieldsSource).not.toContain('Ward/Commune');
    expect(fieldsSource).not.toContain('Select ward/commune');
    expect(vi.form.district).toEqual(expect.any(String));
    expect(en.form.district).toEqual(expect.any(String));
    expect(vi.form.districtPlaceholder).toEqual(expect.any(String));
    expect(en.form.districtPlaceholder).toEqual(expect.any(String));
  });

  it('does not hard-code English validation fallback messages', () => {
    const tSpy = jest.fn((key: string) => key);

    createEmployerSignUpSchema(tSpy as never);

    const callsWithStringFallback = tSpy.mock.calls.filter(([, defaultValue]) => typeof defaultValue === 'string');
    expect(callsWithStringFallback).toEqual([]);
  });
});
