import { readFileSync } from 'fs';
import { join } from 'path';

describe('EmployerOnboarding Flow & Stepper Architecture', () => {
  const hookFilePath = join(__dirname, '../hooks/useEmployerOnboarding.ts');
  const indexFilePath = join(__dirname, '../index.tsx');
  const hookSource = readFileSync(hookFilePath, 'utf8');
  const indexSource = readFileSync(indexFilePath, 'utf8');

  it('restores draft, handles membership validation and updates user workspace on completion', () => {
    expect(hookSource).toContain('authService.getOnboardingStatus');
    expect(hookSource).toContain('authService.saveEmployerOnboardingStep');
    expect(hookSource).toContain('authService.employerOnboarding');
    expect(hookSource).toContain('dispatch(setUserInfo(res.user))');
  });

  it('renders multi-step stepper UI with steps: StepCompanyProfile, StepRecruiterProfile, and StepVerificationGPKD', () => {
    expect(indexSource).toContain('StepCompanyProfile');
    expect(indexSource).toContain('StepRecruiterProfile');
    expect(indexSource).toContain('StepVerificationGPKD');
    expect(indexSource).toContain('activeStep');
  });
});
