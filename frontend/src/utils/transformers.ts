import i18n from '../i18n';

type AnyRecord = Record<string, any>;

const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

/**
 * Transformers Layer: Centralized mapping from Backend API responses to Frontend models.
 * This ensures consistency and avoids "undefined" checks scattered across components.
 */
export const transformQuestion = (q: AnyRecord | null | undefined): AnyRecord | null => {
  if (!q) return null;

  const text = q.text || q.questionText || q.content || '';

  return {
    // Preserve other fields if needed
    ...q,
    id: q.id,
    category: q.category || t('common:labels.uncategorized'),
    question_type: q.question_type || q.type || 'TEXT',
    // Ensure the mapped field "text" is always present for consistent UI use
    text,
  };
};

export const transformQuestionGroup = (
  group: AnyRecord | null | undefined
): AnyRecord | null => {
  if (!group) return null;

  return {
    id: group.id,
    name: group.name || '',
    description: group.description || '',
    questions: (group.questions || []).map(transformQuestion),
    // Preserve other fields
    ...group,
  };
};

export const transformInterviewSession = (
  session: AnyRecord | null | undefined
): AnyRecord | null => {
  if (!session) return null;

  const candidateName =
    session.candidate_name ||
    session.candidate_dict?.fullName ||
    session.jobSeekerDict?.fullName ||
    '';
  const candidateEmail =
    session.candidate_email ||
    session.candidate_dict?.email ||
    session.jobSeekerDict?.email ||
    '';
  const jobName =
    session.job_name ||
    session.job_post_name ||
    session.job_post_dict?.jobName ||
    session.jobPostDict?.jobName ||
    '';
  const scheduledAt = session.scheduled_at || session.startTime || '';
  const inviteToken = session.invite_token || session.inviteToken || null;
  const recordingUrl = session.recording_url || session.recordingUrl || null;
  const transcriptUrl = session.transcript_url || session.transcriptUrl || null;

  return {
    ...session,
    id: session.id,
    job_post_id:
      session.job_post || session.job_post_dict?.id || session.jobPostDict?.id || null,
    candidate_id:
      session.candidate || session.candidate_dict?.id || session.jobSeekerDict?.id,
    candidateName,
    candidateEmail,
    candidate_email: candidateEmail,
    jobName,
    scheduledAt,
    status: session.status || 'PENDING',
    interview_type: session.interview_type || session.interviewType || null,
    type: session.type || session.interview_type || session.interviewType || null,
    inviteToken,
    notes: session.notes || '',
    recordingUrl,
    transcriptUrl,
    questions: (session.questions || []).map(transformQuestion),
  };
};

export const transformJobPost = (job: AnyRecord | null | undefined): AnyRecord | null => {
  if (!job) return null;

  return {
    id: job.id,
    title: job.jobName || job.title || '',
    companyName: job.companyDict?.companyName || '',
    location: job.locationDict?.city || '',
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    deadline: job.deadline,
    ...job,
    // Add alias for common use cases
    jobName: job.jobName || job.title || '',
  };
};

export const transformAppliedResume = (
  resume: AnyRecord | null | undefined
): AnyRecord | null => {
  if (!resume) return null;

  const userId = resume.userId || resume.user?.id || resume.user_id;
  const candidateName = resume.fullName || resume.user?.full_name || '';

  return {
    ...resume,
    id: resume.id,
    candidateId: userId, // Prefer user ID for interview/candidate logic
    userId: userId,
    candidateName,
    fullName: candidateName,
    email: resume.email || resume.user?.email || '',
    resumeSlug: resume.resumeSlug || resume.resume?.slug || '',
    jobName: resume.jobName || '',
    status: resume.status,
  };
};
