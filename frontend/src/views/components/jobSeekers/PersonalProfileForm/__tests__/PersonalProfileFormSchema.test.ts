import { createPersonalProfileSchema } from '../index';

const t = (key: string) => key;

describe('createPersonalProfileSchema', () => {
  it('rejects ID card issue dates in the future', async () => {
    const schema = createPersonalProfileSchema(t as never);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await expect(schema.validateAt('idCardIssueDate', { idCardIssueDate: null })).resolves.toBeNull();
    await expect(schema.validateAt('idCardIssueDate', { idCardIssueDate: tomorrow })).rejects.toThrow(
      'jobSeeker:profile.validation.idCardIssueDateInvalid',
    );
  });

  it('allows blank emergency contact phone but rejects invalid phone text', async () => {
    const schema = createPersonalProfileSchema(t as never);

    await expect(schema.validateAt('emergencyContactPhone', { emergencyContactPhone: '' })).resolves.toBe('');
    await expect(schema.validateAt('emergencyContactPhone', { emergencyContactPhone: 'not-a-phone' })).rejects.toThrow(
      'jobSeeker:profile.validation.phoneInvalid',
    );
  });

  it('rejects gender and marital status outside backend choices', async () => {
    const schema = createPersonalProfileSchema(t as never);

    await expect(schema.validateAt('gender', { gender: 'X' })).rejects.toThrow(
      'jobSeeker:profile.validation.choiceInvalid',
    );
    await expect(schema.validateAt('maritalStatus', { maritalStatus: 'Z' })).rejects.toThrow(
      'jobSeeker:profile.validation.choiceInvalid',
    );
  });
});
