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

  it('uses only configured backend frequency options for defaults', () => {
    expect(getDefaultFrequency([{ id: 2, name: 'Every 3 days' }])).toBe(2);
    expect(getDefaultFrequency([{ id: 7, name: 'Legacy weekly' }])).toBeNull();
    expect(getDefaultFrequency([])).toBeNull();
  });
});
