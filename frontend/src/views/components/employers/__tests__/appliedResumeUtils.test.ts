import { getAppliedResumeJobPostId } from '../appliedResumeUtils';

describe('getAppliedResumeJobPostId', () => {
  it('uses jobPostDict id from employer applied profile list rows', () => {
    expect(getAppliedResumeJobPostId({ id: 1, status: 1, jobPostDict: { id: 42, jobName: 'Frontend Developer' } })).toBe(42);
  });

  it('falls back to nested jobPost id for older payloads', () => {
    expect(getAppliedResumeJobPostId({ id: 1, status: 1, jobPost: { id: 99 } })).toBe(99);
  });

  it('returns null when no job id is available', () => {
    expect(getAppliedResumeJobPostId({ id: 1, status: 1 })).toBeNull();
  });
});
