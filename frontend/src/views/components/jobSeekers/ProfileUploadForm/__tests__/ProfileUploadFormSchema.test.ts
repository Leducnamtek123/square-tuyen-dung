import { createProfileUploadSchema } from '../index';

const t = (key: string) => key;

describe('createProfileUploadSchema', () => {
  it('allows a fixed desired salary where minimum equals maximum', async () => {
    const schema = createProfileUploadSchema(t as never);
    const values = {
      salaryMin: 20000000,
      salaryMax: 20000000,
    };

    await expect(schema.validateAt('salaryMin', values)).resolves.toBe(20000000);
    await expect(schema.validateAt('salaryMax', values)).resolves.toBe(20000000);
  });

  it('rejects a desired salary minimum greater than maximum', async () => {
    const schema = createProfileUploadSchema(t as never);
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
});
