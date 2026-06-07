const t = (key: string) => key;

const loadSchemaFactory = () =>
  (require('../index') as { createCVFormSchema?: (t: typeof t) => any }).createCVFormSchema;

const makeFile = (name: string, type: string, size: number) => ({
  name,
  type,
  size,
}) as File;

describe('createCVFormSchema', () => {
  it('rejects non-PDF files like the backend CvSerializer', async () => {
    const createCVFormSchema = loadSchemaFactory();
    expect(createCVFormSchema).toBeDefined();

    const schema = createCVFormSchema!(t);

    await expect(
      schema.validateAt('files', { files: [makeFile('resume.txt', 'text/plain', 1024)] }),
    ).rejects.toThrow('jobSeeker:profile.validation.filePdfOnly');
  });

  it('rejects PDF files larger than 10MB like the backend CvSerializer', async () => {
    const createCVFormSchema = loadSchemaFactory();
    expect(createCVFormSchema).toBeDefined();

    const schema = createCVFormSchema!(t);

    await expect(
      schema.validateAt('files', {
        files: [makeFile('resume.pdf', 'application/pdf', 10 * 1024 * 1024 + 1)],
      }),
    ).rejects.toThrow('jobSeeker:profile.validation.fileTooLarge');
  });
});
