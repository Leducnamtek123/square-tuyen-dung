import { createAdvancedSkillSchema } from '../index';

const t = (key: string) => key;

describe('createAdvancedSkillSchema', () => {
  it('rejects skill level values outside the rating range', async () => {
    const schema = createAdvancedSkillSchema(t as never);

    await expect(schema.validateAt('level', { level: 999 })).rejects.toThrow(
      'jobSeeker:profile.validation.levelInvalid',
    );
  });
});
