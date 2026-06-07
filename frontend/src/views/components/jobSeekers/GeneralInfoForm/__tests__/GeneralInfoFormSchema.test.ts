import { createGeneralInfoSchema } from '../index';

const t = (key: string) => key;

describe('createGeneralInfoSchema', () => {
  it('allows a fixed desired salary where minimum equals maximum', async () => {
    const schema = createGeneralInfoSchema(t as never);
    const values = {
      salaryMin: 20000000,
      salaryMax: 20000000,
    };

    await expect(schema.validateAt('salaryMin', values)).resolves.toBe(20000000);
    await expect(schema.validateAt('salaryMax', values)).resolves.toBe(20000000);
  });

  it('rejects a desired salary minimum greater than maximum', async () => {
    const schema = createGeneralInfoSchema(t as never);
    const values = {
      salaryMin: 25000000,
      salaryMax: 20000000,
    };

    await expect(schema.validateAt('salaryMin', values)).rejects.toThrow(
      'jobSeeker:profile.validation.salaryMinComparison',
    );
    await expect(schema.validateAt('salaryMax', values)).rejects.toThrow(
      'jobSeeker:profile.validation.salaryMaxComparison',
    );
  });

  it('rejects salaries above the backend storage limit', async () => {
    const schema = createGeneralInfoSchema(t as never);
    const tooLargeSalary = 1_000_000_000_000;

    await expect(schema.validateAt('salaryMin', { salaryMin: tooLargeSalary })).rejects.toThrow(
      'jobSeeker:profile.validation.salaryTooLarge',
    );
    await expect(schema.validateAt('salaryMax', { salaryMax: tooLargeSalary })).rejects.toThrow(
      'jobSeeker:profile.validation.salaryTooLarge',
    );
    await expect(schema.validateAt('expectedSalary', { expectedSalary: tooLargeSalary })).rejects.toThrow(
      'jobSeeker:profile.validation.salaryTooLarge',
    );
  });

  it('rejects decimal salaries before submitting to backend integer fields', async () => {
    const schema = createGeneralInfoSchema(t as never);

    await expect(schema.validateAt('salaryMin', { salaryMin: 1000.5 })).rejects.toThrow(
      'jobSeeker:profile.validation.salaryMinInvalid',
    );
    await expect(schema.validateAt('salaryMax', { salaryMax: 1000.5 })).rejects.toThrow(
      'jobSeeker:profile.validation.salaryMaxInvalid',
    );
    await expect(schema.validateAt('expectedSalary', { expectedSalary: 1000.5 })).rejects.toThrow(
      'jobSeeker:profile.validation.expectedSalaryInvalid',
    );
  });

  it('rejects choice values outside the backend option sets', async () => {
    const schema = createGeneralInfoSchema(t as never);
    const values = {
      position: 999,
      experience: 999,
      academicLevel: 999,
      typeOfWorkplace: 999,
      jobType: 999,
    };

    await expect(schema.validateAt('position', values)).rejects.toThrow(
      'jobSeeker:profile.validation.choiceInvalid',
    );
    await expect(schema.validateAt('experience', values)).rejects.toThrow(
      'jobSeeker:profile.validation.choiceInvalid',
    );
    await expect(schema.validateAt('academicLevel', values)).rejects.toThrow(
      'jobSeeker:profile.validation.choiceInvalid',
    );
    await expect(schema.validateAt('typeOfWorkplace', values)).rejects.toThrow(
      'jobSeeker:profile.validation.choiceInvalid',
    );
    await expect(schema.validateAt('jobType', values)).rejects.toThrow(
      'jobSeeker:profile.validation.choiceInvalid',
    );
  });

  it('rejects invalid relation ids before submitting to backend primary key fields', async () => {
    const schema = createGeneralInfoSchema(t as never);

    await expect(schema.validateAt('career', { career: 0 })).rejects.toThrow(
      'jobSeeker:profile.validation.careerRequired',
    );
    await expect(schema.validateAt('career', { career: 1.5 })).rejects.toThrow(
      'jobSeeker:profile.validation.careerRequired',
    );
    await expect(schema.validateAt('city', { city: 0 })).rejects.toThrow(
      'jobSeeker:profile.validation.cityRequired',
    );
    await expect(schema.validateAt('city', { city: 1.5 })).rejects.toThrow(
      'jobSeeker:profile.validation.cityRequired',
    );
  });
});
