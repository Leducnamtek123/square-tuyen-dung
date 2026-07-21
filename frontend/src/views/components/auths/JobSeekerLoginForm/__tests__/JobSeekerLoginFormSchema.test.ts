import { createJobSeekerLoginSchema } from '../index';

const t = (key: string, defaultValue?: string) => defaultValue || key;

describe('createJobSeekerLoginSchema', () => {
  it('allows existing weak-format passwords because login should authenticate against backend', async () => {
    const schema = createJobSeekerLoginSchema(t as never);

    await expect(schema.validateAt('password', { password: 'pass123' })).resolves.toBe('pass123');
    await expect(schema.validateAt('password', { password: 'testpass123' })).resolves.toBe('testpass123');
  });

  it('still rejects empty passwords', async () => {
    const schema = createJobSeekerLoginSchema(t as never);

    await expect(schema.validateAt('password', { password: '' })).rejects.toThrow('validation.requiredPassword');
  });
});
