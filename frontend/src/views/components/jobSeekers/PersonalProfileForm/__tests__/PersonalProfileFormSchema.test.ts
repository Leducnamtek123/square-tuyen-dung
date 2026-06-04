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
});
