import { createEducationDetailSchema } from '../index';

const t = (key: string) => key;

describe('createEducationDetailSchema', () => {
  it('allows a completion date equal to the start date', async () => {
    const schema = createEducationDetailSchema(t as never);
    const date = new Date('2024-01-01T00:00:00.000Z');
    const values = {
      startDate: date,
      completedDate: date,
    };

    await expect(schema.validateAt('completedDate', values)).resolves.toEqual(date);
  });

  it('rejects a completion date before the start date', async () => {
    const schema = createEducationDetailSchema(t as never);
    const values = {
      startDate: new Date('2024-01-02T00:00:00.000Z'),
      completedDate: new Date('2024-01-01T00:00:00.000Z'),
    };

    await expect(schema.validateAt('completedDate', values)).rejects.toThrow(
      'jobSeeker:profile.validation.completedDateComparison',
    );
  });
});
