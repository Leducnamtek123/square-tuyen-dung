import { createForgotPasswordSchema } from '../index';

const t = (key: string, defaultValue?: string) => defaultValue || key;

const emailWithLength = (secondLabelLength: number) =>
  `a@${'b'.repeat(50)}.${'c'.repeat(secondLabelLength)}.com`;

describe('createForgotPasswordSchema', () => {
  it('allows emails up to the backend limit', async () => {
    const schema = createForgotPasswordSchema(t as never);
    const email = emailWithLength(43);

    expect(email).toHaveLength(100);
    await expect(schema.validateAt('email', { email })).resolves.toBe(email);
  });

  it('rejects emails longer than the backend limit', async () => {
    const schema = createForgotPasswordSchema(t as never);
    const email = emailWithLength(44);

    expect(email).toHaveLength(101);
    await expect(schema.validateAt('email', { email })).rejects.toThrow('validation.maxEmail');
  });
});
