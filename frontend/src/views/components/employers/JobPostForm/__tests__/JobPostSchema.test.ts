import { getJobPostSchema } from '../JobPostSchema';
import { readFileSync } from 'fs';
import { join } from 'path';

const t = (_key: string, defaultValue?: string) => defaultValue || _key;

describe('getJobPostSchema', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('allows job names up to the backend limit', async () => {
    const schema = getJobPostSchema(t as never);
    const backendLimitName = 'a'.repeat(255);

    await expect(schema.validateAt('jobName', { jobName: backendLimitName })).resolves.toBe(backendLimitName);
  });

  it('rejects job names longer than the backend limit', async () => {
    const schema = getJobPostSchema(t as never);
    const tooLongName = 'a'.repeat(256);

    await expect(schema.validateAt('jobName', { jobName: tooLongName })).rejects.toThrow(
      'Job name exceeded allowed length.',
    );
  });

  it('allows a fixed salary where minimum equals maximum', async () => {
    const schema = getJobPostSchema(t as never);
    const values = {
      salaryMin: 20000000,
      salaryMax: 20000000,
    };

    await expect(schema.validateAt('salaryMin', values)).resolves.toBe(20000000);
    await expect(schema.validateAt('salaryMax', values)).resolves.toBe(20000000);
  });

  it('rejects salary minimum greater than salary maximum', async () => {
    const schema = getJobPostSchema(t as never);
    const values = {
      salaryMin: 25000000,
      salaryMax: 20000000,
    };

    await expect(schema.validateAt('salaryMin', values)).rejects.toThrow(
      'Minimum salary must be less than or equal to maximum salary.',
    );
    await expect(schema.validateAt('salaryMax', values)).rejects.toThrow(
      'Maximum salary must be greater than or equal to minimum salary.',
    );
  });

  it('allows today as an application deadline', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 4, 12, 0, 0).getTime());
    const schema = getJobPostSchema(t as never);
    const today = new Date(2026, 5, 4, 0, 0, 0);

    await expect(schema.validateAt('deadline', { deadline: today })).resolves.toEqual(today);
  });

  it('rejects past application deadlines', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 4, 12, 0, 0).getTime());
    const schema = getJobPostSchema(t as never);
    const yesterday = new Date(2026, 5, 3, 0, 0, 0);

    await expect(schema.validateAt('deadline', { deadline: yesterday })).rejects.toThrow(
      'Deadline cannot be in the past.',
    );
  });

  it('keeps the deadline picker aligned with the schema minimum date', () => {
    const fieldsSource = readFileSync(
      join(__dirname, '../JobPostFormFields.tsx'),
      'utf8',
    );

    expect(fieldsSource).toContain('minDate={DATE_OPTIONS.today()}');
    expect(fieldsSource).not.toContain('minDate={DATE_OPTIONS.tomorrow()}');
  });

  it('allows manual job locations without coordinates', async () => {
    const schema = getJobPostSchema(t as never);
    const location = {
      city: 1,
      district: 2,
      address: '123 Nguyen Trai',
      lat: null,
      lng: null,
    };

    await expect(schema.validateAt('location', { location })).resolves.toMatchObject(location);
  });

  it('normalizes blank coordinate fields for manual addresses', async () => {
    const schema = getJobPostSchema(t as never);
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
});
