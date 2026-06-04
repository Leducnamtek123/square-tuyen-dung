import { createJobSeekerSignUpSchema } from '../index';

const translations: Record<string, string> = {
  'validation.maxFullName': 'Full name is too long',
};

const t = (key: string, defaultValue?: string) => translations[key] || defaultValue || key;

describe('createJobSeekerSignUpSchema', () => {
  it('allows full names up to the backend limit', async () => {
    const schema = createJobSeekerSignUpSchema(t as never);
    const fullName = 'a'.repeat(100);

    await expect(schema.validateAt('fullName', { fullName })).resolves.toBe(fullName);
  });

  it('rejects full names longer than the backend limit', async () => {
    const schema = createJobSeekerSignUpSchema(t as never);

    await expect(schema.validateAt('fullName', { fullName: 'a'.repeat(101) })).rejects.toThrow(
      'Full name is too long',
    );
  });
});
