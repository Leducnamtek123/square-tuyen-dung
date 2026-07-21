import { createCertificateSchema } from '../index';
import { readFileSync } from 'fs';
import { join } from 'path';

const t = (key: string) => key;

describe('createCertificateSchema', () => {
  it('allows an expiration date equal to the start date', async () => {
    const schema = createCertificateSchema(t as never);
    const date = new Date('2024-01-01T00:00:00.000Z');
    const values = {
      startDate: date,
      expirationDate: date,
    };

    await expect(schema.validateAt('expirationDate', values)).resolves.toEqual(date);
  });

  it('rejects an expiration date before the start date', async () => {
    const schema = createCertificateSchema(t as never);
    const values = {
      startDate: new Date('2024-01-02T00:00:00.000Z'),
      expirationDate: new Date('2024-01-01T00:00:00.000Z'),
    };

    await expect(schema.validateAt('expirationDate', values)).rejects.toThrow(
      'jobSeeker:profile.validation.expirationDateComparison',
    );
  });

  it('does not cap certificate expiration dates at today', () => {
    const formSource = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
    const expirationFieldSource = formSource.slice(
      formSource.indexOf('name="expirationDate"'),
      formSource.indexOf('</Grid>', formSource.indexOf('name="expirationDate"')),
    );

    expect(expirationFieldSource).not.toContain('maxDate={DATE_OPTIONS.today()}');
  });
});
