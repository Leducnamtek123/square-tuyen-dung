import { createLanguageSkillSchema } from '../index';

const t = (key: string) => key;

describe('createLanguageSkillSchema', () => {
  it('rejects language and level values outside backend choices', async () => {
    const schema = createLanguageSkillSchema(t as never);

    await expect(schema.validateAt('language', { language: 999 })).rejects.toThrow(
      'jobSeeker:profile.validation.choiceInvalid',
    );
    await expect(schema.validateAt('level', { level: 999 })).rejects.toThrow(
      'jobSeeker:profile.validation.levelInvalid',
    );
  });
});
