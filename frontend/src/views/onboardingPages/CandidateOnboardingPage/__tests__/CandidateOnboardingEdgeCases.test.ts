import {
  createCandidateStep1Schema,
  createCandidateStep2Schema,
} from '../schemas/candidateOnboardingSchema';

describe('Candidate Onboarding Form Validation Edge Cases & Boundaries', () => {
  const mockT = (key: string, defaultVal: string) => defaultVal || key;

  describe('Salary Boundary & Negative Value Prevention (Step 2)', () => {
    const schema = createCandidateStep2Schema(mockT);

    it('rejects negative salaryMin values', async () => {
      await expect(
        schema.validateAt('salaryMin', {
          salaryMin: -1,
          skills: ['React'],
        }),
      ).rejects.toThrow('Lương không được là số âm.');

      await expect(
        schema.validateAt('salaryMin', {
          salaryMin: -50000000,
          skills: ['React'],
        }),
      ).rejects.toThrow('Lương không được là số âm.');
    });

    it('rejects negative salaryMax values', async () => {
      await expect(
        schema.validateAt('salaryMax', {
          salaryMax: -1,
          skills: ['React'],
        }),
      ).rejects.toThrow('Lương không được là số âm.');
    });

    it('accepts zero as a valid salary boundary (e.g. unpaid internship or minimum)', async () => {
      await expect(
        schema.validateAt('salaryMin', {
          salaryMin: 0,
          salaryMax: 10000000,
          skills: ['React'],
        }),
      ).resolves.toBe(0);
    });

    it('accepts null or undefined salary when not specified', async () => {
      await expect(
        schema.validateAt('salaryMin', {
          salaryMin: null,
          skills: ['React'],
        }),
      ).resolves.toBeNull();

      await expect(
        schema.validateAt('salaryMin', {
          salaryMin: undefined,
          skills: ['React'],
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe('Input Length & Boundary Testing (Step 1)', () => {
    const schema = createCandidateStep1Schema(mockT);

    it('rejects super long strings exceeding 255 characters in desiredJobTitle', async () => {
      const over255Title = 'A'.repeat(256);
      await expect(
        schema.validateAt('desiredJobTitle', {
          desiredJobTitle: over255Title,
        }),
      ).rejects.toThrow('Vị trí công việc không được vượt quá 255 ký tự.');

      const extreme10kTitle = 'Software Engineer '.repeat(1000);
      await expect(
        schema.validateAt('desiredJobTitle', {
          desiredJobTitle: extreme10kTitle,
        }),
      ).rejects.toThrow('Vị trí công việc không được vượt quá 255 ký tự.');
    });

    it('accepts title with exactly 255 characters at the upper boundary', async () => {
      const exact255Title = 'B'.repeat(255);
      await expect(
        schema.validateAt('desiredJobTitle', {
          desiredJobTitle: exact255Title,
        }),
      ).resolves.toBe(exact255Title);
    });
  });
});
