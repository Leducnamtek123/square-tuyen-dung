import { getAppliedResumeEmailActionState } from '../sendEmailAction';

describe('getAppliedResumeEmailActionState', () => {
  it('disables email action when candidate email is missing', () => {
    expect(getAppliedResumeEmailActionState('')).toEqual({
      canSend: false,
      reasonKey: 'appliedResume.email.missingCandidateEmail',
    });
  });

  it('allows email action when candidate email is present', () => {
    expect(getAppliedResumeEmailActionState('candidate@example.com')).toEqual({
      canSend: true,
      reasonKey: undefined,
    });
  });

  it('disables email action when candidate email is invalid', () => {
    expect(getAppliedResumeEmailActionState('not-an-email')).toEqual({
      canSend: false,
      reasonKey: 'appliedResume.email.invalidCandidateEmail',
    });
  });
});
