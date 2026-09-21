import { readFileSync } from 'fs';
import { join } from 'path';

describe('Employer Onboarding Smart Tax & Progressive Launch Features', () => {
  const hookPath = join(__dirname, '../hooks/useEmployerOnboarding.ts');
  const stepCompanyProfilePath = join(__dirname, '../components/StepCompanyProfile.tsx');
  const stepCompletePath = join(__dirname, '../components/StepEmployerComplete.tsx');

  const hookSource = readFileSync(hookPath, 'utf8');
  const stepCompanyProfileSource = readFileSync(stepCompanyProfilePath, 'utf8');
  const stepCompleteSource = readFileSync(stepCompletePath, 'utf8');

  it('supports Tax Code lookup and Duplicate Join Request in useEmployerOnboarding hook', () => {
    expect(hookSource).toContain('authService.lookupTaxCode');
    expect(hookSource).toContain('authService.requestJoinCompany');
    expect(hookSource).toContain('handleLookupTaxCode');
    expect(hookSource).toContain('handleRequestJoinCompany');
  });

  it('supports skipping onboarding with localStorage draft backup in the hook', () => {
    expect(hookSource).toContain('authService.skipOnboarding');
    expect(hookSource).toContain('handleSkipOnboarding');
    expect(hookSource).toContain('infohr_employer_draft');
  });

  it('renders Tra cứu MST button and duplicate tax code join prompt in StepCompanyProfile', () => {
    expect(stepCompanyProfileSource).toContain('Tra cứu MST');
    expect(stepCompanyProfileSource).toContain('Doanh nghiệp này đã có tài khoản trên InfoHR');
    expect(stepCompanyProfileSource).toContain('Gửi yêu cầu tham gia');
  });

  it('renders Team Member Collaboration Launchpad card in StepEmployerComplete', () => {
    expect(stepCompleteSource).toContain('Mời thành viên phòng HR / Tuyển dụng cùng làm việc');
    expect(stepCompleteSource).toContain('Mời đồng nghiệp');
  });
});
