const t = (key: string) => key;

const loadSchemaFactory = () =>
  (require('../index') as { createApplyFormSchema?: (t: typeof t) => any }).createApplyFormSchema;

describe('createApplyFormSchema', () => {
  it('rejects invalid resume ids before submitting to the backend primary key field', async () => {
    const createApplyFormSchema = loadSchemaFactory();
    expect(createApplyFormSchema).toBeDefined();

    const schema = createApplyFormSchema!(t);

    await expect(schema.validateAt('resume', { resume: 'abc' })).rejects.toThrow(
      'applyForm.validation.resumeRequired',
    );
    await expect(schema.validateAt('resume', { resume: '0' })).rejects.toThrow(
      'applyForm.validation.resumeRequired',
    );
    await expect(schema.validateAt('resume', { resume: '1.5' })).rejects.toThrow(
      'applyForm.validation.resumeRequired',
    );
  });

  it('accepts a positive integer resume id string from the radio group', async () => {
    const createApplyFormSchema = loadSchemaFactory();
    expect(createApplyFormSchema).toBeDefined();

    const schema = createApplyFormSchema!(t);

    await expect(schema.validateAt('resume', { resume: '7' })).resolves.toBe('7');
  });
});
