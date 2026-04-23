import i18n from '../i18n';
import { Question, QuestionGroup, JobPost, InterviewSession, Location, Company } from '../types/models';
import type { TOptions } from 'i18next';

const t = (key: string, options?: TOptions) => i18n.t(key, options);

/**
 * Transformers Layer: Centralized mapping from Backend API responses to Frontend models.
 */
type GenericMap = object;

type QuestionLike = Partial<Question> & {
  id?: number;
  content?: string;
  questionText?: string;
  type?: string;
  category?: string;
  questionType?: string;
};

type InterviewSessionLike = Partial<InterviewSession> & {
  sessionId?: number;
  room?: string;
  room_name?: string;
  jobPostName?: string;
  invite_token?: string;
  candidate_name?: string;
  candidate_email?: string;
  job_name?: string;
  company_name?: string;
  scheduled_at?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  recording_url?: string | null;
  interviewType?: string;
  transcriptUrl?: string | null;
  candidateDict?: { fullName?: string; email?: string; id?: number };
  jobSeekerDict?: { fullName?: string; email?: string; id?: number };
  jobPostDict?: { jobName?: string; companyName?: string; id?: number };
  companyDict?: { companyName?: string };
};

type JobPostLike = Partial<JobPost> & {
  title?: string;
  companyDict?: { companyName?: string };
  locationDict?: { city?: string };
};

type AppliedResumeLike = GenericMap & {
  id?: number;
  userId?: number;
  fullName?: string;
  email?: string;
  resumeSlug?: string;
  jobName?: string;
  status?: number;
  user?: { id?: number; fullName?: string; email?: string };
  resume?: { slug?: string };
};

const asMap = (value: unknown): GenericMap | null => {
  if (!value || typeof value !== 'object') return null;
  return value as GenericMap;
};

export const transformQuestion = (q: unknown): Question | null => {
  const map = asMap(q) as QuestionLike | null;
  if (!map) return null;

  const id = typeof map.id === 'number' ? map.id : 0;
  const text =
    (typeof map.text === 'string' && map.text) ||
    (typeof map.questionText === 'string' && map.questionText) ||
    (typeof map.content === 'string' && map.content) ||
    '';

  if (!text) return null;

  return {
    id,
    category: (map.category || 'Uncategorized') as string,
    questionType: (map.questionType || map.type || 'TEXT') as string,
    text,
    content: typeof map.content === 'string' ? map.content : undefined,
    questionText: typeof map.questionText === 'string' ? map.questionText : undefined,
    type: typeof map.type === 'string' ? map.type : undefined,
  };
};

export const transformQuestionGroup = (group: unknown): QuestionGroup | null => {
  const map = asMap(group) as (Partial<QuestionGroup> & { questions?: unknown[] }) | null;
  if (!map) return null;

  return {
    id: typeof map.id === 'number' ? map.id : 0,
    name: typeof map.name === 'string' ? map.name : '',
    description: typeof map.description === 'string' ? map.description : '',
    questions: (Array.isArray(map.questions) ? map.questions : [])
      .map((item) => transformQuestion(item))
      .filter((item): item is Question => !!item),
  };
};

export const transformInterviewSession = (session: unknown): InterviewSession | null => {
  const s = asMap(session) as InterviewSessionLike | null;
  if (!s) return null;

  const candidateName =
    (typeof s.candidateName === 'string' && s.candidateName) ||
    (typeof s.candidate_name === 'string' && s.candidate_name) ||
    (typeof s.candidateDict?.fullName === 'string' && s.candidateDict.fullName) ||
    (typeof s.jobSeekerDict?.fullName === 'string' && s.jobSeekerDict.fullName) ||
    '';
  const candidateEmail =
    (typeof s.candidateEmail === 'string' && s.candidateEmail) ||
    (typeof s.candidate_email === 'string' && s.candidate_email) ||
    (typeof s.candidateDict?.email === 'string' && s.candidateDict.email) ||
    (typeof s.jobSeekerDict?.email === 'string' && s.jobSeekerDict.email) ||
    '';
  const jobName =
    (typeof s.jobName === 'string' && s.jobName) ||
    (typeof s.job_name === 'string' && s.job_name) ||
    (typeof s.jobPostName === 'string' && s.jobPostName) ||
    (typeof s.jobPostDict?.jobName === 'string' && s.jobPostDict.jobName) ||
    '';
  const scheduledAt =
    (typeof s.scheduledAt === 'string' && s.scheduledAt) ||
    (typeof s.scheduled_at === 'string' && s.scheduled_at) ||
    (typeof s.startTime === 'string' && s.startTime) ||
    (typeof s.start_time === 'string' && s.start_time) ||
    '';
  const companyName =
    (typeof s.companyName === 'string' && s.companyName) ||
    (typeof s.company_name === 'string' && s.company_name) ||
    (typeof s.companyDict?.companyName === 'string' && s.companyDict.companyName) ||
    (typeof s.jobPostDict?.companyName === 'string' && s.jobPostDict.companyName) ||
    '';
  const roomName =
    (typeof s.roomName === 'string' && s.roomName) ||
    (typeof s.room_name === 'string' && s.room_name) ||
    (typeof s.room === 'string' ? s.room : '');
  const inviteToken =
    (typeof s.inviteToken === 'string' && s.inviteToken) ||
    (typeof s.invite_token === 'string' && s.invite_token) ||
    undefined;

  return {
    id: typeof s.id === 'number' ? s.id : typeof s.sessionId === 'number' ? s.sessionId : 0,
    candidateName,
    candidateEmail,
    companyName,
    jobName,
    roomName,
    scheduledAt,
    status: typeof s.status === 'string' ? s.status.trim() : 'PENDING',
    interview_type: typeof s.interviewType === 'string' ? s.interviewType : undefined,
    type: typeof (s.type || s.interviewType) === 'string' ? (s.type || s.interviewType)! : '',
    inviteToken,
    recordingUrl:
      (typeof s.recordingUrl === 'string' && s.recordingUrl) ||
      (typeof s.recording_url === 'string' && s.recording_url) ||
      null,
    questions: (Array.isArray(s.questions) ? s.questions : [])
      .map((item) => transformQuestion(item))
      .filter((item): item is Question => !!item),
  };
};

export const transformJobPost = (job: unknown): JobPost | null => {
  const map = asMap(job) as JobPostLike | null;
  if (!map) return null;

  return {
    id: typeof map.id === 'number' ? map.id : 0,
    jobName:
      (typeof map.jobName === 'string' && map.jobName) ||
      (typeof map.title === 'string' ? map.title : ''),
    slug: typeof map.slug === 'string' ? map.slug : '',
    company: map.companyDict ? ({ companyName: map.companyDict.companyName || '' } as Company) : null,
    location: { id: 0, city: map.locationDict?.city || '', address: '' } as Location,
    salaryMin: typeof map.salaryMin === 'number' ? map.salaryMin : 0,
    salaryMax: typeof map.salaryMax === 'number' ? map.salaryMax : 0,
    deadline: typeof map.deadline === 'string' ? map.deadline : '',
    quantity: typeof map.quantity === 'number' ? map.quantity : 0,
    status: (map.status || 'active') as JobPost['status'],
  };
};

export const transformAppliedResume = (resume: unknown): GenericMap | null => {
  const map = asMap(resume) as AppliedResumeLike | null;
  if (!map) return null;

  const userId = (typeof map.userId === 'number' ? map.userId : map.user?.id) || 0;
  const candidateName =
    (typeof map.fullName === 'string' && map.fullName) ||
    (typeof map.user?.fullName === 'string' ? map.user.fullName : '');

  return {
    ...map,
    id: typeof map.id === 'number' ? map.id : 0,
    candidateId: userId,
    userId,
    candidateName,
    fullName: candidateName,
    email:
      (typeof map.email === 'string' && map.email) ||
      (typeof map.user?.email === 'string' ? map.user.email : ''),
    resumeSlug:
      (typeof map.resumeSlug === 'string' && map.resumeSlug) ||
      (typeof map.resume?.slug === 'string' ? map.resume.slug : ''),
    jobName: typeof map.jobName === 'string' ? map.jobName : '',
    status: typeof map.status === 'number' ? map.status : 0,
  };
};

