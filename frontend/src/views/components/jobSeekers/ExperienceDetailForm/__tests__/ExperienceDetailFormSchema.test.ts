import { createExperienceDetailSchema } from '../index';

const t = (key: string) => key;

describe('createExperienceDetailSchema', () => {
  it('allows an end date equal to the start date', async () => {
    const schema = createExperienceDetailSchema(t as never);
    const date = new Date('2024-01-01T00:00:00.000Z');
    const values = {
      startDate: date,
      endDate: date,
    };

    await expect(schema.validateAt('endDate', values)).resolves.toEqual(date);
  });

  it('rejects an end date before the start date', async () => {
    const schema = createExperienceDetailSchema(t as never);
    const values = {
      startDate: new Date('2024-01-02T00:00:00.000Z'),
      endDate: new Date('2024-01-01T00:00:00.000Z'),
    };

    await expect(schema.validateAt('endDate', values)).rejects.toThrow(
      'jobSeeker:profile.validation.endDateComparison',
    );
  });

  it('rejects decimal last salary before submitting to the backend integer field', async () => {
    const schema = createExperienceDetailSchema(t as never);

    await expect(schema.validateAt('lastSalary', { lastSalary: 1000.5 })).rejects.toThrow(
      'jobSeeker:profile.validation.lastSalaryInvalid',
    );
  });

  it('rejects descriptions longer than the backend model limit', async () => {
    const schema = createExperienceDetailSchema(t as never);

    await expect(
      schema.validateAt('description', { description: 'x'.repeat(501) }),
    ).rejects.toThrow('jobSeeker:profile.validation.descriptionMax');
  });
});
