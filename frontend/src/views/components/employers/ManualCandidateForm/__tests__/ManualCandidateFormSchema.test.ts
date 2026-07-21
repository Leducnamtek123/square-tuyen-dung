import { createManualCandidateSchema } from '../index';

const t = (key: string) => key;

describe('createManualCandidateSchema', () => {
  it('rejects whitespace-only required identity fields before submitting to the backend', async () => {
    const schema = createManualCandidateSchema(t as never);

    await expect(schema.validateAt('fullName', { fullName: '   ' })).rejects.toThrow(
      'employer:manualCandidate.validation.fullNameRequired',
    );
    await expect(schema.validateAt('title', { title: '   ' })).rejects.toThrow(
      'employer:manualCandidate.validation.titleRequired',
    );
  });

  it('rejects identity fields that exceed applied-profile activity storage limits', async () => {
    const schema = createManualCandidateSchema(t as never);

    await expect(schema.validateAt('fullName', { fullName: 'A'.repeat(101) })).rejects.toThrow(
      'employer:manualCandidate.validation.fullNameMax',
    );
    await expect(schema.validateAt('email', { email: `${'a'.repeat(92)}@example.com` })).rejects.toThrow(
      'employer:manualCandidate.validation.emailMax',
    );
    await expect(schema.validateAt('phone', { phone: '0909000000123456' })).rejects.toThrow(
      'employer:manualCandidate.validation.phoneMax',
    );
  });

  it('allows blank phone but rejects invalid phone text', async () => {
    const schema = createManualCandidateSchema(t as never);

    await expect(schema.validateAt('phone', { phone: '' })).resolves.toBe('');
    await expect(schema.validateAt('phone', { phone: 'not-a-phone' })).rejects.toThrow(
      'employer:manualCandidate.validation.phoneInvalid',
    );
  });

  it('allows an empty CV file but rejects non-PDF files and PDFs larger than 10MB', async () => {
    const schema = createManualCandidateSchema(t as never);
    const textFile = new File(['not a pdf'], 'candidate.txt', { type: 'text/plain' });
    const largePdf = new File([new Uint8Array((10 * 1024 * 1024) + 1)], 'candidate.pdf', {
      type: 'application/pdf',
    });

    await expect(schema.validateAt('file', { file: null })).resolves.toBeNull();
    await expect(schema.validateAt('file', { file: textFile })).rejects.toThrow(
      'employer:manualCandidate.validation.filePdfOnly',
    );
    await expect(schema.validateAt('file', { file: largePdf })).rejects.toThrow(
      'employer:manualCandidate.validation.fileTooLarge',
    );
  });

  it('rejects manual candidate salaries above the backend storage limit', async () => {
    const schema = createManualCandidateSchema(t as never);
    const tooLargeSalary = 1_000_000_000_000;

    await expect(schema.validateAt('salaryMin', { salaryMin: tooLargeSalary })).rejects.toThrow(
      'employer:manualCandidate.validation.salaryTooLarge',
    );
    await expect(schema.validateAt('salaryMax', { salaryMax: tooLargeSalary })).rejects.toThrow(
      'employer:manualCandidate.validation.salaryTooLarge',
    );
    await expect(schema.validateAt('expectedSalary', { expectedSalary: tooLargeSalary })).rejects.toThrow(
      'employer:manualCandidate.validation.salaryTooLarge',
    );
  });

  it('rejects decimal salaries before submitting to the backend integer fields', async () => {
    const schema = createManualCandidateSchema(t as never);

    await expect(schema.validateAt('salaryMin', { salaryMin: 1000.5 })).rejects.toThrow(
      'employer:manualCandidate.validation.salaryInvalid',
    );
    await expect(schema.validateAt('salaryMax', { salaryMax: 1000.5 })).rejects.toThrow(
      'employer:manualCandidate.validation.salaryInvalid',
    );
    await expect(schema.validateAt('expectedSalary', { expectedSalary: 1000.5 })).rejects.toThrow(
      'employer:manualCandidate.validation.salaryInvalid',
    );
  });

  it('rejects stale choice values before submitting to the backend', async () => {
    const schema = createManualCandidateSchema(t as never);

    await expect(schema.validateAt('position', { position: 999 })).rejects.toThrow(
      'employer:manualCandidate.validation.choiceInvalid',
    );
    await expect(schema.validateAt('academicLevel', { academicLevel: 999 })).rejects.toThrow(
      'employer:manualCandidate.validation.choiceInvalid',
    );
    await expect(schema.validateAt('experience', { experience: 999 })).rejects.toThrow(
      'employer:manualCandidate.validation.choiceInvalid',
    );
    await expect(schema.validateAt('typeOfWorkplace', { typeOfWorkplace: 999 })).rejects.toThrow(
      'employer:manualCandidate.validation.choiceInvalid',
    );
    await expect(schema.validateAt('jobType', { jobType: 999 })).rejects.toThrow(
      'employer:manualCandidate.validation.choiceInvalid',
    );
  });

  it('allows blank optional relations but rejects invalid relation ids', async () => {
    const schema = createManualCandidateSchema(t as never);

    await expect(schema.validateAt('career', { career: null })).resolves.toBeNull();
    await expect(schema.validateAt('city', { city: null })).resolves.toBeNull();
    await expect(schema.validateAt('career', { career: 0 })).rejects.toThrow(
      'employer:manualCandidate.validation.choiceInvalid',
    );
    await expect(schema.validateAt('career', { career: 1.5 })).rejects.toThrow(
      'employer:manualCandidate.validation.choiceInvalid',
    );
    await expect(schema.validateAt('city', { city: 0 })).rejects.toThrow(
      'employer:manualCandidate.validation.choiceInvalid',
    );
    await expect(schema.validateAt('city', { city: 1.5 })).rejects.toThrow(
      'employer:manualCandidate.validation.choiceInvalid',
    );
  });

  it('requires a valid job post id when creating an applied profile', async () => {
    const schema = createManualCandidateSchema(t as never, true);

    await expect(schema.validateAt('jobPost', { jobPost: null })).rejects.toThrow(
      'employer:manualCandidate.validation.jobPostRequired',
    );
    await expect(schema.validateAt('jobPost', { jobPost: 0 })).rejects.toThrow(
      'employer:manualCandidate.validation.choiceInvalid',
    );
    await expect(schema.validateAt('jobPost', { jobPost: 1.5 })).rejects.toThrow(
      'employer:manualCandidate.validation.choiceInvalid',
    );
    await expect(schema.validateAt('jobPost', { jobPost: 7 })).resolves.toBe(7);
  });
});
