import type { JobPostActivity } from '@/types/models';

export const getAppliedResumeJobPostId = (activity: Pick<JobPostActivity, 'jobPost' | 'jobPostDict'>): string | number | null => {
  return activity.jobPostDict?.id ?? activity.jobPost?.id ?? null;
};
