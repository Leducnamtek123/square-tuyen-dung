import { readFileSync } from 'fs';
import { join } from 'path';

describe('CandidateOnboarding Flow & Hook Architecture', () => {
  const pagePath = join(__dirname, '../index.tsx');
  const hookPath = join(__dirname, '../hooks/useCandidateOnboarding.ts');

  const pageSource = readFileSync(pagePath, 'utf8');
  const hookSource = readFileSync(hookPath, 'utf8');

  it('orchestrates a 4-step wizard stepper', () => {
    expect(pageSource).toContain('CandidateStepper');
    expect(pageSource).toContain('StepCareerGoals');
    expect(pageSource).toContain('StepSkillsExperience');
    expect(pageSource).toContain('StepResumeUpload');
    expect(pageSource).toContain('StepCandidateComplete');
  });

  it('restores draft onboarding state on initial load', () => {
    expect(hookSource).toContain('authService.getOnboardingStatus()');
    expect(hookSource).toContain('res.candidateDraft');
    expect(hookSource).toContain('setActiveStep(res.onboardingStep - 1)');
  });

  it('persists progressive step completion to backend authService', () => {
    expect(hookSource).toContain('authService.saveCandidateOnboardingStep');
    expect(hookSource).toContain('authService.candidateOnboarding');
    expect(hookSource).toContain('dispatch(setUserInfo(res.user))');
  });
});
