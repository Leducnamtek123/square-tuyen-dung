import { createCompanyFormSchema } from '../index';
import { readFileSync } from 'fs';
import { join } from 'path';

const t = (_key: string, defaultValue?: string) => defaultValue || _key;

describe('createCompanyFormSchema', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('allows manual company locations without coordinates', async () => {
    const schema = createCompanyFormSchema(t as never);
    const location = {
      city: 1,
      district: 2,
      address: '123 Nguyen Trai',
      lat: '',
      lng: '',
    };

    await expect(schema.validateAt('location', { location })).resolves.toMatchObject({
      ...location,
      lat: null,
      lng: null,
    });
  });

  it('rejects future founded dates', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 4, 12, 0, 0).getTime());
    const schema = createCompanyFormSchema(t as never);
    const tomorrow = new Date(2026, 5, 5, 0, 0, 0);

    await expect(schema.validateAt('since', { since: tomorrow })).rejects.toThrow(
      'Founded date cannot be in the future.',
    );
  });

  it('rejects invalid employee size options', async () => {
    const schema = createCompanyFormSchema(t as never);

    await expect(schema.validateAt('employeeSize', { employeeSize: 999 })).rejects.toThrow(
      'Invalid company size.',
    );
  });

  it('keeps founded date and coordinate fields aligned with schema', () => {
    const fieldsSource = readFileSync(join(__dirname, '../CompanyFormFields.tsx'), 'utf8');
    const latFieldSource = fieldsSource.slice(
      fieldsSource.indexOf('name="location.lat"'),
      fieldsSource.indexOf('</Grid>', fieldsSource.indexOf('name="location.lat"')),
    );
    const lngFieldSource = fieldsSource.slice(
      fieldsSource.indexOf('name="location.lng"'),
      fieldsSource.indexOf('</Grid>', fieldsSource.indexOf('name="location.lng"')),
    );

    expect(fieldsSource).toContain('name="since"');
    expect(fieldsSource).toContain('maxDate={DATE_OPTIONS.today()}');
    expect(latFieldSource).not.toContain('showRequired={true}');
    expect(lngFieldSource).not.toContain('showRequired={true}');
  });
});
