import i18n from '../i18n';
import { Question, QuestionGroup, JobPost, InterviewSession } from '../types/models';

const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

/**
 * Transformers Layer: Centralized mapping from Backend API responses to Frontend models.
 */
export const transformQuestion = (q: Record<string, unknown> | null | undefined): Question | null => {
  if (!q) return null;

  const text = q.text || q.questionText || q.content || '';

  return {
    ...q,
    id: q.id,
    category: q.category || t('common:labels.uncategorized'),
    questionType: q.questionType || q.type || 'TEXT',
    text,
  } as unknown as Question;
};

export const transformQuestionGroup = (
  group: Record<string, unknown> | null | undefined,
): QuestionGroup | null => {
  if (!group) return null;

  return {
    id: group.id,
    name: group.name || '',
    description: group.description || '',
    questions: (Array.isArray(group.questions) ? group.questions : []).map((q) => transformQuestion(q as Record<string, unknown>)).filter((q: Question | null): q is Question => !!q),
    ...group,
  } as unknown as QuestionGroup;
};

export const transformInterviewSession = (
  session: Record<string, unknown> | null | undefined,
): InterviewSession | null => {
  if (!session) return null;
  const s = session as Record<string, unknown>;
  const dicts = s as {
    candidateDict?: { fullName: string; email: string; id: number };
    jobSeekerDict?: { fullName: string; email: string; id: number };
    jobPostDict?: { jobName: string; companyName: string; id: number };
    companyDict?: { companyName: string };
  };

  const candidateName = (
    s.candidateName ||
    dicts.candidateDict?.fullName ||
    dicts.jobSeekerDict?.fullName ||
    ''
  ) as string;
  const candidateEmail = (
    s.candidateEmail ||
    dicts.candidateDict?.email ||
    dicts.jobSeekerDict?.email ||
    ''
  ) as string;
  const jobName = (
    s.jobName ||
    s.jobPostName ||
    dicts.jobPostDict?.jobName ||
    ''
  ) as string;
  const scheduledAt = (s.scheduledAt || s.startTime || '') as string;
  const inviteToken = (s.inviteToken || undefined) as string | undefined;
  const recordingUrl = (s.recordingUrl || null) as string | null | undefined;
  const transcriptUrl = (s.transcriptUrl || null) as string | null | undefined;
  const companyName = (
    s.companyName ||
    dicts.companyDict?.companyName ||
    dicts.jobPostDict?.companyName ||
    ''
  ) as string;

  return {
    ...s,
    id: s.id as number,
    jobPostId: (
      s.jobPost || dicts.jobPostDict?.id || null
    ) as number | null,
    candidateId: (
      s.candidate || dicts.candidateDict?.id || dicts.jobSeekerDict?.id
    ) as number | undefined,
    candidateName,
    candidateEmail,
    companyName,
    jobName,
    roomName: (s.roomName || s.room || '') as string,
    scheduledAt,
    status: (s.status as string) || 'PENDING',
    interviewType: (s.interviewType || undefined) as string | undefined,
    type: (s.type || s.interviewType || undefined) as string | undefined,
    inviteToken,
    notes: (s.notes || '') as string,
    recordingUrl,
    transcriptUrl,
    questions: (Array.isArray(s.questions) ? s.questions : []).map((q) => transformQuestion(q as Record<string, unknown>)).filter((q: Question | null): q is Question => !!q),
  } as unknown as InterviewSession;
};

export const transformJobPost = (job: Record<string, unknown> | null | undefined): JobPost | null => {
  if (!job) return null;
  const dicts = job as {
    companyDict?: { companyName: string };
    locationDict?: { city: string };
  };

  return {
    id: job.id as number,
    title: (job.jobName || job.title || '') as string,
    companyName: (dicts.companyDict?.companyName || '') as string,
    location: (dicts.locationDict?.city || '') as string,
    salaryMin: job.salaryMin as number,
    salaryMax: job.salaryMax as number,
    deadline: job.deadline as string,
    ...job,
    jobName: (job.jobName || job.title || '') as string,
  } as unknown as JobPost;
};

export const transformAppliedResume = (
  resume: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null => {
  if (!resume) return null;
  const dicts = resume as {
    user?: { id: number; fullName: string; email: string };
    resume?: { slug: string };
  };

  const userId = (resume.userId || dicts.user?.id) as number;
  const candidateName = (resume.fullName || dicts.user?.fullName || '') as string;

  return {
    ...resume,
    id: resume.id as number,
    candidateId: userId,
    userId: userId,
    candidateName,
    fullName: candidateName,
    email: (resume.email || dicts.user?.email || '') as string,
    resumeSlug: (resume.resumeSlug || dicts.resume?.slug || '') as string,
    jobName: (resume.jobName || '') as string,
    status: resume.status as number,
  };
};
