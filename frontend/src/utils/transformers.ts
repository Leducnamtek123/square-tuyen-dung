import i18n from '../i18n';
import { Question, QuestionGroup, JobPost, InterviewSession, Location, Company } from '../types/models';

const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

/**
 * Transformers Layer: Centralized mapping from Backend API responses to Frontend models.
 */
export const transformQuestion = (q: Record<string, unknown> | null | undefined): Question | null => {
  if (!q) return null;

  const text = (q.text || q.questionText || q.content || '') as string;

  return {
    id: q.id as number,
    category: (q.category || 'Uncategorized') as string,
    questionType: (q.questionType || q.type || 'TEXT') as string,
    text,
    content: q.content as string | undefined,
    questionText: q.questionText as string | undefined,
    type: q.type as string | undefined,
  };
};

export const transformQuestionGroup = (
  group: Record<string, unknown> | null | undefined,
): QuestionGroup | null => {
  if (!group) return null;

  return {
    id: group.id as number,
    name: (group.name || '') as string,
    description: (group.description || '') as string,
    questions: (Array.isArray(group.questions) ? group.questions : []).map((q) => transformQuestion(q as Record<string, unknown>)).filter((q: Question | null): q is Question => !!q),
  };
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
    id: s.id as number,
    candidateName,
    candidateEmail,
    companyName,
    jobName,
    roomName: (s.roomName || s.room || '') as string,
    scheduledAt,
    status: (s.status as string) || 'PENDING',
    interview_type: (s.interviewType || undefined) as string | undefined,
    type: ((s.type || s.interviewType || '') as string),
    inviteToken,
    recordingUrl,
    questions: (Array.isArray(s.questions) ? s.questions : []).map((q) => transformQuestion(q as Record<string, unknown>)).filter((q: Question | null): q is Question => !!q),
  };
};

export const transformJobPost = (job: Record<string, unknown> | null | undefined): JobPost | null => {
  if (!job) return null;
  const dicts = job as {
    companyDict?: { companyName: string };
    locationDict?: { city: string };
  };

  return {
    id: job.id as number,
    jobName: (job.jobName || job.title || '') as string,
    slug: (job.slug || '') as string,
    company: dicts.companyDict ? { companyName: dicts.companyDict.companyName } as Company : null,
    location: { id: 0, city: dicts.locationDict?.city || '', address: '' } as Location,
    salaryMin: (job.salaryMin || 0) as number,
    salaryMax: (job.salaryMax || 0) as number,
    deadline: (job.deadline || '') as string,
    quantity: (job.quantity || 0) as number,
    status: (job.status || 'active') as JobPost['status'],
  };
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
