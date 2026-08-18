import {
  createCandidateStep1Schema,
  createCandidateStep2Schema,
  createCandidateStep3Schema,
} from '../schemas/candidateOnboardingSchema';

describe('CandidateOnboarding Validation Schemas (Yup)', () => {
  const mockT = (key: string, defaultVal: string) => defaultVal || key;

  describe('createCandidateStep1Schema', () => {
    const schema = createCandidateStep1Schema(mockT);

    it('rejects empty desiredJobTitle', async () => {
      await expect(
        schema.validate({ desiredJobTitle: '', careerId: 1, cityId: 1 }),
      ).rejects.toThrow('Vui lòng nhập vị trí công việc mong muốn.');
    });

    it('rejects missing careerId or cityId', async () => {
      await expect(
        schema.validate({ desiredJobTitle: 'Frontend Engineer', careerId: '', cityId: 1 }),
      ).rejects.toThrow('Vui lòng chọn ngành nghề chính.');

      await expect(
        schema.validate({ desiredJobTitle: 'Frontend Engineer', careerId: 1, cityId: '' }),
      ).rejects.toThrow('Vui lòng chọn địa điểm làm việc mong muốn.');
    });

    it('accepts valid Step 1 data', async () => {
      const validData = {
        desiredJobTitle: 'Senior React Developer',
        careerId: 2,
        cityId: 1,
        typeOfWorkplace: 1,
      };
      const result = await schema.validate(validData);
      expect(result.desiredJobTitle).toBe('Senior React Developer');
    });
  });

  describe('createCandidateStep2Schema', () => {
    const schema = createCandidateStep2Schema(mockT);

    it('rejects empty skills array', async () => {
      await expect(
        schema.validate({ skills: [] }),
      ).rejects.toThrow('Vui lòng chọn hoặc nhập ít nhất 1 kỹ năng.');
    });

    it('rejects salaryMin greater than salaryMax when salary is not negotiable', async () => {
      await expect(
        schema.validate({
          skills: ['TypeScript'],
          isSalaryNegotiable: false,
          salaryMin: 30000000,
          salaryMax: 20000000,
        }),
      ).rejects.toThrow('Lương tối thiểu không được lớn hơn lương tối đa.');
    });

    it('allows any salary range when isSalaryNegotiable is true', async () => {
      const result = await schema.validate({
        skills: ['Next.js', 'Node.js'],
        isSalaryNegotiable: true,
        salaryMin: 50000000,
        salaryMax: 10000000,
      });
      expect(result.isSalaryNegotiable).toBe(true);
      expect(result.skills).toHaveLength(2);
    });
  });

  describe('createCandidateStep3Schema', () => {
    const schema = createCandidateStep3Schema();

    it('accepts optional CV file payload or empty values', async () => {
      const resultEmpty = await schema.validate({});
      expect(resultEmpty).toBeDefined();

      const resultWithCV = await schema.validate({
        fileId: 105,
        fileName: 'NguyenVanA_CV.pdf',
        fileUrl: 'https://cdn.example.com/resumes/NguyenVanA_CV.pdf',
      });
      expect(resultWithCV.fileId).toBe(105);
    });
  });
});
