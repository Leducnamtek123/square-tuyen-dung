import { readFileSync } from 'fs';
import { join } from 'path';
import { validateVerificationLegalProfile } from '../VerificationPage/index';

describe('Employer VerificationPage & Business Validation Rules', () => {
  const filePath = join(__dirname, '../VerificationPage/index.tsx');
  const source = readFileSync(filePath, 'utf8');

  const mockT = (key: string, defaultVal?: string) => defaultVal || key;

  it('renders VerificationIntroCard and VerificationLegalProfileForm', () => {
    expect(source).toContain('<VerificationIntroCard');
    expect(source).toContain('<VerificationLegalProfileForm');
    expect(source).toContain('companyVerificationService');
  });

  describe('validateVerificationLegalProfile pure validator', () => {
    it('catches missing required business fields', () => {
      const invalidProfile = {
        companyName: '',
        taxCode: '',
        businessLicense: '',
        representative: '',
        phone: '',
        email: '',
      };

      const errors = validateVerificationLegalProfile(invalidProfile as any, mockT as any);
      expect(errors.companyName).toBeDefined();
      expect(errors.taxCode).toBeDefined();
      expect(errors.businessLicense).toBeDefined();
      expect(errors.representative).toBeDefined();
      expect(errors.phone).toBeDefined();
      expect(errors.email).toBeDefined();
    });

    it('rejects invalid email and invalid phone format', () => {
      const profile = {
        companyName: 'Công ty Công nghệ ABC',
        taxCode: '0101234567',
        businessLicense: 'GPKD-123456',
        representative: 'Nguyễn Văn A',
        phone: 'invalid-phone-string',
        email: 'invalid-email-format',
      };

      const errors = validateVerificationLegalProfile(profile as any, mockT as any);
      expect(errors.email).toBeDefined();
      expect(errors.phone).toBeDefined();
    });

    it('passes on valid legal profile submission', () => {
      const validProfile = {
        companyName: 'Công ty TNHH Giải Pháp Phần Mềm',
        taxCode: '0312345678',
        businessLicense: 'GPKD-889900',
        representative: 'Trần Thị B',
        phone: '0901234567',
        email: 'contact@softwarecorp.vn',
        website: 'https://softwarecorp.vn',
      };

      const errors = validateVerificationLegalProfile(validProfile as any, mockT as any);
      expect(Object.keys(errors)).toHaveLength(0);
    });
  });
});
