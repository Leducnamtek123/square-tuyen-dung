import { getJobPostSchema } from '../JobPostSchema';

describe('JobPostForm Schema & Validation Rules', () => {
  const mockT = (key: string) => key;
  const schema = getJobPostSchema(mockT as any);

  it('rejects salaryMin greater than salaryMax', async () => {
    const invalidSalaryData = {
      jobName: 'Senior Go Developer',
      career: 1,
      position: 1,
      experience: 1,
      typeOfWorkplace: 1,
      jobType: 1,
      quantity: 2,
      genderRequired: 'N',
      salaryMin: 50000000,
      salaryMax: 30000000,
      academicLevel: 1,
      deadline: new Date(Date.now() + 86400000),
      contactPersonName: 'Tran Van A',
      contactPersonPhone: '0912345678',
      contactPersonEmail: 'hr@example.com',
      location: {
        city: 1,
        district: 1,
        address: '123 Nguyen Trai',
      },
      jobDescription: { getCurrentContent: () => ({ hasText: () => true }) },
      jobRequirement: { getCurrentContent: () => ({ hasText: () => true }) },
      benefitsEnjoyed: { getCurrentContent: () => ({ hasText: () => true }) },
    };

    await expect(schema.validate(invalidSalaryData)).rejects.toThrow();
  });

  it('validates required contact person details with regex phone and email check', async () => {
    const invalidPhoneData = {
      jobName: 'Senior Go Developer',
      career: 1,
      position: 1,
      experience: 1,
      typeOfWorkplace: 1,
      jobType: 1,
      quantity: 2,
      genderRequired: 'N',
      salaryMin: 20000000,
      salaryMax: 30000000,
      academicLevel: 1,
      deadline: new Date(Date.now() + 86400000),
      contactPersonName: 'Tran Van A',
      contactPersonPhone: 'invalid-phone',
      contactPersonEmail: 'not-an-email',
      location: {
        city: 1,
        district: 1,
        address: '123 Nguyen Trai',
      },
      jobDescription: { getCurrentContent: () => ({ hasText: () => true }) },
      jobRequirement: { getCurrentContent: () => ({ hasText: () => true }) },
      benefitsEnjoyed: { getCurrentContent: () => ({ hasText: () => true }) },
    };

    await expect(schema.validate(invalidPhoneData)).rejects.toThrow();
  });
});
