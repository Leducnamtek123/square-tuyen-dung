import { readFileSync } from 'fs';
import { join } from 'path';
import { createEmployerSignUpSchema } from '../index';

const t = (_key: string, defaultValue?: string) => defaultValue || _key;

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
});
