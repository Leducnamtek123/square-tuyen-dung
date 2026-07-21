import { createSendMailSchema } from '../index';

const t = (key: string) => key;

describe('createSendMailSchema', () => {
  it('uses employer i18n keys for validation messages', async () => {
    const schema = createSendMailSchema(t as never);

    await expect(schema.validateAt('email', { email: '' })).rejects.toThrow(
      'sendMailCard.validation.emailRequired',
    );
    await expect(schema.validateAt('email', { email: 'not-an-email' })).rejects.toThrow(
      'sendMailCard.validation.emailInvalid',
    );
    await expect(schema.validateAt('title', { title: '' })).rejects.toThrow(
      'sendMailCard.validation.subjectRequired',
    );
  });
});
