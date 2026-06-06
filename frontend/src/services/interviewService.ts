import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';
import type { InterviewSession, InterviewEvaluation } from '../types/models';
import type { PaginatedResponse } from '../types/api';
import { normalizePaginatedResponse } from '../utils/apiResponse';

type IdType = string | number;

type RoomNameLike = { roomName?: string } | string | number | null | undefined;
type UpdateSessionStatusOptions = {
  inviteToken?: string;
};

/* ── Request DTOs ─────────────────────────────────────────────────────── */

export interface GetSessionsParams {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  ordering?: string;
  jobPostId?: number;
}

export interface ScheduleSessionInput {
  candidate?: number;
  job_post?: number;
  scheduled_at?: string;
  type?: 'technical' | 'behavioral' | 'mixed';
  question_ids?: number[];
  question_group?: number;
  voice_profile?: number | null;
  notes?: string;
}

export interface SubmitEvaluationInput {
  interview: number;
  attitude_score?: number;
  professional_score?: number;
  overall_score?: number;
  result?: 'passed' | 'failed' | 'pending';
  comments?: string;
  proposed_salary?: number;
}

/* ── Response Types ───────────────────────────────────────────────────── */

interface LiveKitTokenResponse {
  token: string;
  url?: string;
  serverUrl?: string;
  server_url?: string;
  roomName: string;
}

export type HrPresenceTokenResponse = LiveKitTokenResponse & {
  mode: string;
  participantName: string;
  participantIdentity?: string;
  companyName?: string | null;
};

interface SessionMetrics {
  sessionId: number;
  status: string;
  startTime: string | null;
  endTime: string | null;
  elapsedSeconds: number | null;
  duration: number | null;
  questionCursor: number;
  totalQuestions: number;
  transcriptCount: number;
  candidateName: string | null;
  jobName: string | null;
}

interface TriggerAiEvaluationResponse {
  status: string;
  detail?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeTriggerAiEvaluationResponse = (raw: unknown): TriggerAiEvaluationResponse => {
  if (!isRecord(raw)) {
    return { status: 'queued' };
  }

  const status = typeof raw.status === 'string' && raw.status.trim()
    ? raw.status
    : 'queued';
  const detail = typeof raw.detail === 'string'
    ? raw.detail
    : typeof raw.message === 'string'
      ? raw.message
      : undefined;

  return detail ? { status, detail } : { status };
};

/* ── Service ──────────────────────────────────────────────────────────── */

const interviewService = {
  getSessions: (params: GetSessionsParams = {}): Promise<PaginatedResponse<InterviewSession>> => {
    const url = 'interview/web/sessions/';
    return httpRequest
      .get(url, { params })
      .then((res) => presignInObject(res))
      .then((data) => normalizePaginatedResponse<InterviewSession>(data));
  },

  getSessionDetail: (id: IdType): Promise<InterviewSession> => {
    const url = `interview/web/sessions/${id}/`;
    return httpRequest.get(url).then((res) => presignInObject(res)) as Promise<InterviewSession>;
  },

  getSessionDetailByInviteToken: (inviteToken: string): Promise<InterviewSession> => {
    const url = `interview/web/sessions/invite/${inviteToken}/`;
    return httpRequest.get(url).then((res) => presignInObject(res)) as Promise<InterviewSession>;
  },

  scheduleSession: (data: ScheduleSessionInput): Promise<InterviewSession> => {
    const url = 'interview/web/sessions/';
    return httpRequest.post(url, data) as Promise<InterviewSession>;
  },

  updateSession: (id: IdType, data: Partial<ScheduleSessionInput>): Promise<InterviewSession> => {
    const url = `interview/web/sessions/${id}/`;
    return httpRequest.patch(url, data).then((res) => presignInObject(res)) as Promise<InterviewSession>;
  },

  deleteSession: (id: IdType): Promise<void> => {
    const url = `interview/web/sessions/${id}/`;
    return httpRequest.delete(url) as Promise<void>;
  },

  updateSessionStatus: (
    roomName: RoomNameLike,
    status: string,
    options: UpdateSessionStatusOptions = {},
  ): Promise<InterviewSession> => {
    const target =
      typeof roomName === 'object' && roomName ? roomName.roomName : roomName;

    const url = `interview/web/sessions/${target}/status/`;
    const payload = options.inviteToken
      ? { status, invite_token: options.inviteToken }
      : { status };
    return httpRequest.patch(url, payload).then((res) => presignInObject(res)) as Promise<InterviewSession>;
  },

  getLiveKitToken: (inviteToken: string): Promise<LiveKitTokenResponse> => {
    const url = `interview/web/sessions/invite/${inviteToken}/livekit-token/`;
    return httpRequest.get(url) as Promise<LiveKitTokenResponse>;
  },

  triggerAiEvaluation: (id: IdType): Promise<TriggerAiEvaluationResponse> => {
    const url = `interview/web/sessions/${id}/evaluate-ai/`;
    return Promise.resolve(httpRequest.post(url)).then(normalizeTriggerAiEvaluationResponse);
  },

  submitEvaluation: (data: SubmitEvaluationInput): Promise<InterviewEvaluation> => {
    const url = 'interview/web/evaluations/';
    return httpRequest.post(url, data) as Promise<InterviewEvaluation>;
  },

  getEvaluations: (sessionId: IdType): Promise<PaginatedResponse<InterviewEvaluation>> => {
    const url = `interview/web/evaluations/`;
    return httpRequest
      .get(url, { params: { interview: sessionId } })
      .then((data) => normalizePaginatedResponse<InterviewEvaluation>(data));
  },

  getObserverToken: (sessionId: IdType): Promise<LiveKitTokenResponse & { mode: string }> => {
    const url = `interview/web/sessions/${sessionId}/observer-token/`;
    return httpRequest.post(url) as Promise<LiveKitTokenResponse & { mode: string }>;
  },

  getHrPresenceToken: (sessionId: IdType): Promise<HrPresenceTokenResponse> => {
    const url = `interview/web/sessions/${sessionId}/hr-token/`;
    return httpRequest.post(url) as Promise<HrPresenceTokenResponse>;
  },

  getSessionMetrics: (sessionId: IdType): Promise<SessionMetrics> => {
    const url = `interview/web/sessions/${sessionId}/live-metrics/`;
    return httpRequest.get(url) as Promise<SessionMetrics>;
  },

  getSSEUrl: (sessionId: IdType): string => {
    const base = (process.env.NEXT_PUBLIC_API_BASE || '/api').replace(/\/$/, '');
    return `${base}/interview/web/sessions/${sessionId}/stream/`;
  },
};

export default interviewService;
