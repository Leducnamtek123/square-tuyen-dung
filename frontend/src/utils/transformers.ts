import i18n from '../i18n';

type AnyRecord = Record<string, any>;

const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

/**
 * Transformers Layer: Centralized mapping from Backend API responses to Frontend models.
 *
 * NOTE: Since camelizeKeys is applied in httpRequest's response interceptor,
 * all data arriving here is already in camelCase. The snake_case fallbacks
 * have been removed.
 */
export const transformQuestion = (q: AnyRecord | null | undefined): AnyRecord | null => {
  if (!q) return null;

  const text = q.text || q.questionText || q.content || '';

  return {
    ...q,
    id: q.id,
    category: q.category || t('common:labels.uncategorized'),
    questionType: q.questionType || q.type || 'TEXT',
    text,
  };
};

export const transformQuestionGroup = (
  group: AnyRecord | null | undefined,
): AnyRecord | null => {
  if (!group) return null;

  return {
    id: group.id,
    name: group.name || '',
    description: group.description || '',
    questions: (group.questions || []).map(transformQuestion),
    ...group,
  };
};

export const transformInterviewSession = (
  session: AnyRecord | null | undefined,
): AnyRecord | null => {
  if (!session) return null;

  const candidateName =
    session.candidateName ||
    session.candidateDict?.fullName ||
    session.jobSeekerDict?.fullName ||
    '';
  const candidateEmail =
    session.candidateEmail ||
    session.candidateDict?.email ||
    session.jobSeekerDict?.email ||
    '';
  const jobName =
    session.jobName ||
    session.jobPostName ||
    session.jobPostDict?.jobName ||
    '';
  const scheduledAt = session.scheduledAt || session.startTime || '';
  const inviteToken = session.inviteToken || null;
  const recordingUrl = session.recordingUrl || null;
  const transcriptUrl = session.transcriptUrl || null;
  const companyName =
    session.companyName ||
    session.companyDict?.companyName ||
    session.jobPostDict?.companyName ||
    '';

  return {
    ...session,
    id: session.id,
    jobPostId:
      session.jobPost || session.jobPostDict?.id || null,
    candidateId:
      session.candidate || session.candidateDict?.id || session.jobSeekerDict?.id,
    candidateName,
    candidateEmail,
    companyName,
    jobName,
    roomName: session.roomName || session.room || '',
    scheduledAt,
    status: session.status || 'PENDING',
    interviewType: session.interviewType || null,
    type: session.type || session.interviewType || null,
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
    jobName: job.jobName || job.title || '',
  };
};

export const transformAppliedResume = (
  resume: AnyRecord | null | undefined,
): AnyRecord | null => {
  if (!resume) return null;

  const userId = resume.userId || resume.user?.id;
  const candidateName = resume.fullName || resume.user?.fullName || '';

  return {
    ...resume,
    id: resume.id,
    candidateId: userId,
    userId: userId,
    candidateName,
    fullName: candidateName,
    email: resume.email || resume.user?.email || '',
    resumeSlug: resume.resumeSlug || resume.resume?.slug || '',
    jobName: resume.jobName || '',
    status: resume.status,
  };
};
