import { readFileSync } from 'fs';
import { join } from 'path';

describe('Candidate Onboarding Progressive & AI Fast-Track Features', () => {
  const hookPath = join(__dirname, '../hooks/useCandidateOnboarding.ts');
  const stepCareerGoalsPath = join(__dirname, '../components/StepCareerGoals.tsx');
  const stepCompletePath = join(__dirname, '../components/StepCandidateComplete.tsx');
  const bannerPath = join(__dirname, '../../components/OnboardingProgressBanner.tsx');

  const hookSource = readFileSync(hookPath, 'utf8');
  const stepCareerGoalsSource = readFileSync(stepCareerGoalsPath, 'utf8');
  const stepCompleteSource = readFileSync(stepCompletePath, 'utf8');
  const bannerSource = readFileSync(bannerPath, 'utf8');

  it('supports CV-First auto parsing with authService.parseCandidateCv in the hook', () => {
    expect(hookSource).toContain('authService.parseCandidateCv');
    expect(hookSource).toContain('handleCvAutoParse');
    expect(hookSource).toContain('isParsingCv');
    expect(hookSource).toContain('cvParseSuccess');
  });

  it('supports skipping onboarding to enable Progressive Onboarding with localStorage draft fallback', () => {
    expect(hookSource).toContain('authService.skipOnboarding');
    expect(hookSource).toContain('handleSkipOnboarding');
    expect(hookSource).toContain('infohr_candidate_draft');
  });

  it('renders CV-First upload banner in StepCareerGoals', () => {
    expect(stepCareerGoalsSource).toContain('onCvFileSelected');
    expect(stepCareerGoalsSource).toContain('cvFileInputRef');
    expect(stepCareerGoalsSource).toContain('Tải CV tự động điền');
  });

  it('renders AILA AI Voice Interview Launchpad card in StepCandidateComplete', () => {
    expect(stepCompleteSource).toContain('Luyện phỏng vấn thử với AI Voice (AILA)');
    expect(stepCompleteSource).toContain('/luyen-phong-van?jobTitle=');
    expect(stepCompleteSource).toContain('Thử phỏng vấn 5 phút');
  });

  it('renders OnboardingProgressBanner component with progress bar and completion action', () => {
    expect(bannerSource).toContain('OnboardingProgressBanner');
    expect(bannerSource).toContain('LinearProgress');
    expect(bannerSource).toContain('Hoàn tất ngay');
  });
});
