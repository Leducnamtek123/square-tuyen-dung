import { createJobPostNotificationSchema, getDefaultFrequency } from '../index';

const t = (key: string) => key;

describe('createJobPostNotificationSchema', () => {
  it('rejects choice values outside backend option sets', async () => {
    const schema = createJobPostNotificationSchema(t as never);

    await expect(schema.validateAt('frequency', { frequency: 7 })).rejects.toThrow(
      'jobSeeker:jobManagement.notifications.form.validation.frequencyInvalid',
    );
    await expect(schema.validateAt('position', { position: 999 })).rejects.toThrow(
      'jobSeeker:jobManagement.notifications.form.validation.choiceInvalid',
    );
    await expect(schema.validateAt('experience', { experience: 999 })).rejects.toThrow(
      'jobSeeker:jobManagement.notifications.form.validation.choiceInvalid',
    );
  });

  it('requires a valid notification frequency', async () => {
    const schema = createJobPostNotificationSchema(t as never);

    await expect(schema.validateAt('frequency', { frequency: null })).rejects.toThrow(
      'jobSeeker:jobManagement.notifications.form.validation.frequencyRequired',
    );
  });

  it('allows notification keywords up to the backend length limit', async () => {
    const schema = createJobPostNotificationSchema(t as never);
    const maxLengthKeyword = 'a'.repeat(255);

    await expect(schema.validateAt('jobName', { jobName: maxLengthKeyword })).resolves.toBe(maxLengthKeyword);
    await expect(schema.validateAt('jobName', { jobName: 'a'.repeat(256) })).rejects.toThrow(
      'jobSeeker:jobManagement.notifications.form.validation.keywordMax',
    );
  });

  it('rejects salary values the backend serializer will reject', async () => {
    const schema = createJobPostNotificationSchema(t as never);

    await expect(schema.validateAt('salary', { salary: 1000.5 })).rejects.toThrow(
      'jobSeeker:jobManagement.notifications.form.validation.salaryInvalid',
    );
    await expect(schema.validateAt('salary', { salary: -1 })).rejects.toThrow(
      'jobSeeker:jobManagement.notifications.form.validation.salaryInvalid',
    );
  });

  it('rejects decimal relation ids before submitting to backend primary key fields', async () => {
    const schema = createJobPostNotificationSchema(t as never);

    await expect(schema.validateAt('career', { career: 1.5 })).rejects.toThrow(
      'jobSeeker:jobManagement.notifications.form.validation.careerRequired',
    );
    await expect(schema.validateAt('city', { city: 1.5 })).rejects.toThrow(
      'jobSeeker:jobManagement.notifications.form.validation.cityRequired',
    );
  });

  it('uses only configured backend frequency options for defaults', () => {
    expect(getDefaultFrequency([{ id: 2, name: 'Every 3 days' }])).toBe(2);
    expect(getDefaultFrequency([{ id: 7, name: 'Legacy weekly' }])).toBeNull();
    expect(getDefaultFrequency([])).toBeNull();
  });
});
