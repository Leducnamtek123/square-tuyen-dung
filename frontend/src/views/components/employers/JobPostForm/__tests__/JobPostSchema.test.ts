import { getJobPostSchema } from '../JobPostSchema';
import { readFileSync } from 'fs';
import { join } from 'path';

const t = (key: string, defaultValue?: string) => {
  const translations: Record<string, string> = {
    'jobPostForm.validation.jobnameexceededallowedlength': 'Job name exceeded allowed length.',
    'jobPostForm.validation.minSalaryLess': 'Minimum salary must be less than or equal to maximum salary.',
    'jobPostForm.validation.maxSalaryGreater': 'Maximum salary must be greater than or equal to minimum salary.',
    'jobPostForm.validation.salaryTooLarge': 'Salary exceeds the allowed limit.',
    'jobPostForm.validation.deadlinemustbeaftertoday': 'Deadline cannot be in the past.',
  };

  return translations[key] || defaultValue || key;
};

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

  it('rejects salaries above the backend integer limit', async () => {
    const schema = getJobPostSchema(t as never);
    const tooLargeSalary = 2_147_483_648;

    await expect(schema.validateAt('salaryMin', { salaryMin: tooLargeSalary })).rejects.toThrow(
      'Salary exceeds the allowed limit.',
    );
    await expect(schema.validateAt('salaryMax', { salaryMax: tooLargeSalary })).rejects.toThrow(
      'Salary exceeds the allowed limit.',
    );
  });

  it('rejects decimal quantity and salaries before submitting to backend integer fields', async () => {
    const schema = getJobPostSchema(t as never);

    await expect(schema.validateAt('quantity', { quantity: 1.5 })).rejects.toThrow(
      'jobPostForm.validation.invalidnumberofvacancies',
    );
    await expect(schema.validateAt('salaryMin', { salaryMin: 1000.5 })).rejects.toThrow(
      'jobPostForm.validation.invalidminimumsalary',
    );
    await expect(schema.validateAt('salaryMax', { salaryMax: 1000.5 })).rejects.toThrow(
      'jobPostForm.validation.invalidmaximumsalary',
    );
  });

  it('rejects choice values outside the backend option sets', async () => {
    const schema = getJobPostSchema(t as never);
    const values = {
      position: 999,
      experience: 999,
      academicLevel: 999,
      typeOfWorkplace: 999,
      jobType: 999,
      genderRequired: 'X',
    };

    await expect(schema.validateAt('position', values)).rejects.toThrow(
      'jobPostForm.validation.choiceInvalid',
    );
    await expect(schema.validateAt('experience', values)).rejects.toThrow(
      'jobPostForm.validation.choiceInvalid',
    );
    await expect(schema.validateAt('academicLevel', values)).rejects.toThrow(
      'jobPostForm.validation.choiceInvalid',
    );
    await expect(schema.validateAt('typeOfWorkplace', values)).rejects.toThrow(
      'jobPostForm.validation.choiceInvalid',
    );
    await expect(schema.validateAt('jobType', values)).rejects.toThrow(
      'jobPostForm.validation.choiceInvalid',
    );
    await expect(schema.validateAt('genderRequired', values)).rejects.toThrow(
      'jobPostForm.validation.choiceInvalid',
    );
  });

  it('rejects invalid relation ids before submitting to backend primary key fields', async () => {
    const schema = getJobPostSchema(t as never);

    await expect(schema.validateAt('career', { career: 0 })).rejects.toThrow(
      'jobPostForm.validation.careerisrequired',
    );
    await expect(schema.validateAt('career', { career: 1.5 })).rejects.toThrow(
      'jobPostForm.validation.careerisrequired',
    );
    await expect(schema.validateAt('interviewTemplate', { interviewTemplate: 0 })).rejects.toThrow(
      'jobPostForm.validation.interviewtemplateinvalid',
    );
    await expect(schema.validateAt('interviewTemplate', { interviewTemplate: 1.5 })).rejects.toThrow(
      'jobPostForm.validation.interviewtemplateinvalid',
    );
    await expect(schema.validateAt('location.city', { location: { city: 0 } })).rejects.toThrow(
      'jobPostForm.validation.cityprovinceisrequired',
    );
    await expect(schema.validateAt('location.city', { location: { city: 1.5 } })).rejects.toThrow(
      'jobPostForm.validation.cityprovinceisrequired',
    );
    await expect(schema.validateAt('location.district', { location: { district: 0 } })).rejects.toThrow(
      'jobPostForm.validation.districtisrequired',
    );
    await expect(schema.validateAt('location.district', { location: { district: 1.5 } })).rejects.toThrow(
      'jobPostForm.validation.districtisrequired',
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

  it('does not hard-code English validation fallback messages', () => {
    const tSpy = jest.fn((key: string) => key);

    getJobPostSchema(tSpy as never);

    const callsWithStringFallback = tSpy.mock.calls.filter(([, defaultValue]) => typeof defaultValue === 'string');
    expect(callsWithStringFallback).toEqual([]);
  });

  it('does not hard-code fallback labels or placeholders in job post form fields', () => {
    const fieldsSource = readFileSync(
      join(__dirname, '../JobPostFormFields.tsx'),
      'utf8',
    );

    expect(fieldsSource).not.toMatch(/t\('jobPostForm\.[^']+'\s*,\s*['"]/);
    expect(fieldsSource).not.toContain('defaultValue');
  });
});
