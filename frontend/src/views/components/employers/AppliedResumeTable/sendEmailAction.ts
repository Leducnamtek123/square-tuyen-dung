const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface AppliedResumeEmailActionState {
  canSend: boolean;
  reasonKey?: 'appliedResume.email.missingCandidateEmail' | 'appliedResume.email.invalidCandidateEmail';
}

export const getAppliedResumeEmailActionState = (email?: string | null): AppliedResumeEmailActionState => {
  const normalizedEmail = (email || '').trim();
  if (!normalizedEmail) {
    return {
      canSend: false,
      reasonKey: 'appliedResume.email.missingCandidateEmail',
    };
  }

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return {
      canSend: false,
      reasonKey: 'appliedResume.email.invalidCandidateEmail',
    };
  }

  return { canSend: true };
};
