import {
  createEmployerStep1Schema,
  createEmployerStep2Schema,
  createEmployerStep3Schema,
} from '../schemas/employerOnboardingSchema';

describe('EmployerOnboarding Validation Schemas (Yup)', () => {
  const mockT = (key: string, defaultVal: string) => defaultVal || key;

  describe('createEmployerStep1Schema', () => {
    const schema = createEmployerStep1Schema(mockT);

    it('rejects empty companyName', async () => {
      await expect(
        schema.validate({ companyName: '' }),
      ).rejects.toThrow('Vui lòng nhập tên công ty / doanh nghiệp.');
    });

    it('accepts valid Step 1 company details', async () => {
      const result = await schema.validate({
        companyName: 'FPT Software',
        taxCode: '0101234567',
        employeeSize: 3,
        address: 'Duy Tan, Cau Giay, Ha Noi',
      });
      expect(result.companyName).toBe('FPT Software');
    });
  });

  describe('createEmployerStep2Schema', () => {
    const schema = createEmployerStep2Schema(mockT);

    it('rejects empty recruiterName', async () => {
      await expect(
        schema.validate({ recruiterName: '' }),
      ).rejects.toThrow('Vui lòng nhập họ tên người phụ trách tuyển dụng.');
    });

    it('rejects invalid recruiterEmail format', async () => {
      await expect(
        schema.validate({
          recruiterName: 'Nguyen HR Manager',
          recruiterEmail: 'invalid-email',
        }),
      ).rejects.toThrow('Email không hợp lệ');
    });

    it('accepts valid Step 2 recruiter info', async () => {
      const result = await schema.validate({
        recruiterName: 'Le Thi Thu',
        recruiterTitle: 'HR Director',
        recruiterPhone: '0988776655',
        recruiterEmail: 'hr.director@company.com',
      });
      expect(result.recruiterName).toBe('Le Thi Thu');
    });
  });

  describe('createEmployerStep3Schema', () => {
    const schema = createEmployerStep3Schema();

    it('accepts optional GPKD business license file upload', async () => {
      const result = await schema.validate({
        gpkdFileId: 42,
        gpkdFileName: 'GPKD_2026.pdf',
        gpkdFileUrl: 'https://cdn.example.com/licenses/GPKD_2026.pdf',
      });
      expect(result.gpkdFileId).toBe(42);
    });
  });
});
