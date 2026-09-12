import i18n from '../i18n';
import { Question, QuestionGroup, JobPost, InterviewSession, Location, Company } from '../types/models';
import type { TOptions } from 'i18next';

const t = (key: string, options?: TOptions) => i18n.t(key, options);

/**
 * Transformers Layer: Centralized mapping from Backend API responses to Frontend models.
 */
type GenericMap = object;

type QuestionLike = Partial<Question> & {
  id?: number | string;
  content?: string;
  title?: string;
  sort_order?: number;
  sortOrder?: number;
  questionText?: string;
  question_text?: string;
  type?: string;
  category?: string;
  category_display?: string;
  categoryDisplay?: string;
  questionType?: string;
  difficulty?: number | string;
  difficulty_display?: string;
  difficultyDisplay?: string;
  career?: number | null;
  career_name?: string;
  careerName?: string;
  default_duration_seconds?: number;
  defaultDurationSeconds?: number;
  answer_structure?: Question['answer_structure'];
  answerStructure?: Question['answer_structure'];
  interviewer_intent?: string;
  interviewerIntent?: string;
  important_tips?: Question['important_tips'];
  importantTips?: Question['important_tips'];
  follow_up_questions?: string[];
  followUpQuestions?: string[];
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
  companyDict?: { companyName?: string; logo?: string };
  companyLogo?: string | null;
  company_logo?: string | null;
  sessionType?: 'official' | 'mock' | string;
  session_type?: 'official' | 'mock' | string;
  questions_count?: number;
  questionsCount?: number;
  ai_overall_score?: number | string | null;
  ai_technical_score?: number | string | null;
  ai_communication_score?: number | string | null;
  ai_summary?: string | null;
  session_metadata?: Record<string, unknown> | null;
  notes?: string | null;
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

export const parseEntityId = (val: unknown): number => {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (typeof val === 'string' && val.trim() !== '') {
    const parsed = Number(val);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
};

const transformQuestion = (q: unknown): Question | null => {
  const map = asMap(q) as QuestionLike | null;
  if (!map) return null;

  const id = parseEntityId(map.id);
  const text =
    (typeof map.text === 'string' && map.text) ||
    (typeof map.questionText === 'string' && map.questionText) ||
    (typeof map.question_text === 'string' && map.question_text) ||
    (typeof map.content === 'string' && map.content) ||
    '';

  if (!text) return null;

  const defaultDurationSeconds =
    typeof map.default_duration_seconds === 'number'
      ? map.default_duration_seconds
      : typeof map.defaultDurationSeconds === 'number'
      ? map.defaultDurationSeconds
      : 120;

  const answerStructure = map.answer_structure || map.answerStructure || null;
  const interviewerIntent =
    typeof map.interviewer_intent === 'string'
      ? map.interviewer_intent
      : typeof map.interviewerIntent === 'string'
      ? map.interviewerIntent
      : undefined;

  const importantTips =
    Array.isArray(map.important_tips)
      ? map.important_tips
      : Array.isArray(map.importantTips)
      ? map.importantTips
      : null;

  const followUpQuestions =
    Array.isArray(map.follow_up_questions)
      ? map.follow_up_questions
      : Array.isArray(map.followUpQuestions)
      ? map.followUpQuestions
      : null;

  const sortOrder = typeof map.sort_order === 'number' ? map.sort_order : typeof map.sortOrder === 'number' ? map.sortOrder : 0;
  const rawTitle = typeof map.title === 'string' ? map.title.trim() : '';

  return {
    id,
    title: rawTitle || undefined,
    category: (map.category || 'Uncategorized') as string,
    category_display: map.category_display || map.categoryDisplay || undefined,
    questionType: (map.questionType || map.type || 'TEXT') as string,
    text,
    content: typeof map.content === 'string' ? map.content : undefined,
    questionText: typeof map.questionText === 'string' ? map.questionText : text,
    question_text: typeof map.question_text === 'string' ? map.question_text : text,
    sort_order: sortOrder,
    sortOrder,
    type: typeof map.type === 'string' ? map.type : undefined,
    difficulty: map.difficulty,
    difficulty_display: map.difficulty_display || map.difficultyDisplay || undefined,
    career: typeof map.career === 'number' ? map.career : undefined,
    career_name: map.career_name || map.careerName || undefined,
    default_duration_seconds: defaultDurationSeconds,
    defaultDurationSeconds,
    answer_structure: answerStructure,
    answerStructure,
    interviewer_intent: interviewerIntent,
    interviewerIntent,
    important_tips: importantTips,
    importantTips,
    follow_up_questions: followUpQuestions,
    followUpQuestions,
  };
};

export const getQuestionShortTitle = (q: Partial<Question> | null | undefined): string => {
  if (!q) return '';
  if (q.title && q.title.trim()) return q.title.trim();
  const text = (q.text || q.questionText || q.question_text || '').trim();
  if (!text) return '';
  const firstClause = text.split('?')[0].split('.')[0].trim();
  const words = firstClause.split(/\s+/);
  if (words.length > 7) {
    return words.slice(0, 7).join(' ') + '...';
  }
  return firstClause;
};

const transformQuestionGroup = (group: unknown): QuestionGroup | null => {
  const map = asMap(group) as (Partial<QuestionGroup> & { questions?: unknown[] }) | null;
  if (!map) return null;

  return {
    id: parseEntityId(map.id),
    name: typeof map.name === 'string' ? map.name : '',
    description: typeof map.description === 'string' ? map.description : '',
    questions: (Array.isArray(map.questions) ? map.questions : []).flatMap((item) => {
      const question = transformQuestion(item);
      return question ? [question] : [];
    }),
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
    (typeof (s.sessionMetadata as any)?.position_title === 'string' && (s.sessionMetadata as any).position_title) ||
    (typeof (s.session_metadata as any)?.position_title === 'string' && (s.session_metadata as any).position_title) ||
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
  const companyLogo =
    (typeof s.companyLogo === 'string' && s.companyLogo) ||
    (typeof s.company_logo === 'string' && s.company_logo) ||
    (typeof s.companyDict?.logo === 'string' && s.companyDict.logo) ||
    null;
  const roomName =
    (typeof s.roomName === 'string' && s.roomName) ||
    (typeof s.room_name === 'string' && s.room_name) ||
    (typeof s.room === 'string' ? s.room : '');
  const inviteToken =
    (typeof s.inviteToken === 'string' && s.inviteToken) ||
    (typeof s.invite_token === 'string' && s.invite_token) ||
    undefined;

  const sessionType = (s.sessionType || s.session_type || 'official') as 'official' | 'mock';
  const duration =
    typeof s.duration === 'number'
      ? s.duration
      : s.duration != null && !isNaN(Number(s.duration))
      ? Number(s.duration)
      : null;
  const parseScore = (val1: unknown, val2: unknown): number | null => {
    if (typeof val1 === 'number' && !isNaN(val1)) return val1;
    if (typeof val2 === 'number' && !isNaN(val2)) return val2;
    if (val1 != null && val1 !== '' && !isNaN(Number(val1))) return Number(val1);
    if (val2 != null && val2 !== '' && !isNaN(Number(val2))) return Number(val2);
    return null;
  };

  const aiOverallScore = parseScore(s.aiOverallScore, s.ai_overall_score);
  const aiTechnicalScore = parseScore(s.aiTechnicalScore, s.ai_technical_score);
  const aiCommunicationScore = parseScore(s.aiCommunicationScore, s.ai_communication_score);

  const questionsCount =
    typeof s.questionsCount === 'number'
      ? s.questionsCount
      : typeof s.questions_count === 'number'
      ? s.questions_count
      : Array.isArray(s.questions)
      ? s.questions.length
      : undefined;

  return {
    id: parseEntityId(s.id ?? s.sessionId),
    candidateName,
    candidateEmail,
    companyName,
    companyLogo,
    jobName,
    roomName,
    scheduledAt,
    duration,
    status: typeof s.status === 'string' ? s.status.trim() : 'PENDING',
    interview_type: typeof s.interviewType === 'string' ? s.interviewType : undefined,
    type: typeof (s.type || s.interviewType) === 'string' ? (s.type || s.interviewType)! : '',
    sessionType,
    session_type: sessionType,
    aiOverallScore,
    ai_overall_score: aiOverallScore,
    aiTechnicalScore,
    ai_technical_score: aiTechnicalScore,
    aiCommunicationScore,
    ai_communication_score: aiCommunicationScore,
    aiStrengths: s.aiStrengths || s.ai_strengths || null,
    ai_strengths: s.ai_strengths || s.aiStrengths || null,
    aiWeaknesses: s.aiWeaknesses || s.ai_weaknesses || null,
    ai_weaknesses: s.ai_weaknesses || s.aiWeaknesses || null,
    aiDetailedFeedback: s.aiDetailedFeedback || s.ai_detailed_feedback || null,
    ai_detailed_feedback: s.ai_detailed_feedback || s.aiDetailedFeedback || null,
    aiSummary: typeof s.aiSummary === 'string' ? s.aiSummary : typeof s.ai_summary === 'string' ? s.ai_summary : null,
    ai_summary: typeof s.ai_summary === 'string' ? s.ai_summary : typeof s.aiSummary === 'string' ? s.aiSummary : null,
    sessionMetadata: (s.sessionMetadata || s.session_metadata) as any,
    session_metadata: (s.session_metadata || s.sessionMetadata) as any,
    questionsCount,
    inviteToken,
    recordingUrl:
      (typeof s.recordingUrl === 'string' && s.recordingUrl) ||
      (typeof s.recording_url === 'string' && s.recording_url) ||
      null,
    questions: (Array.isArray(s.questions) ? s.questions : [])
      .flatMap((item) => {
        const question = transformQuestion(item);
        return question ? [question] : [];
      })
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id),
    transcripts: Array.isArray(s.transcripts) ? s.transcripts : [],
  };
};

const transformJobPost = (job: unknown): JobPost | null => {
  const map = asMap(job) as JobPostLike | null;
  if (!map) return null;

  const locId = parseEntityId((map.location as any)?.id ?? (map.locationDict as any)?.id);

  return {
    id: parseEntityId(map.id),
    jobName:
      (typeof map.jobName === 'string' && map.jobName) ||
      (typeof map.title === 'string' ? map.title : ''),
    slug: typeof map.slug === 'string' ? map.slug : '',
    company: map.companyDict ? ({ companyName: map.companyDict.companyName || '' } as Company) : null,
    location: { id: locId, city: map.locationDict?.city || (map.location as any)?.city || '', address: (map.location as any)?.address || '' } as Location,
    salaryMin: typeof map.salaryMin === 'number' ? map.salaryMin : 0,
    salaryMax: typeof map.salaryMax === 'number' ? map.salaryMax : 0,
    deadline: typeof map.deadline === 'string' ? map.deadline : '',
    quantity: typeof map.quantity === 'number' ? map.quantity : 0,
    status: (map.status || 'active') as JobPost['status'],
  };
};

const transformAppliedResume = (resume: unknown): GenericMap | null => {
  const map = asMap(resume) as AppliedResumeLike | null;
  if (!map) return null;

  const rawUserId = map.userId ?? map.user?.id;
  const userId = parseEntityId(rawUserId);
  const candidateName =
    (typeof map.fullName === 'string' && map.fullName) ||
    (typeof map.user?.fullName === 'string' ? map.user.fullName : '');

  return {
    ...map,
    id: parseEntityId(map.id),
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

