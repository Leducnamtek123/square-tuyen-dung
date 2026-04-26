import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';
import type { InterviewSession, InterviewEvaluation } from '../types/models';
import type { PaginatedResponse } from '../types/api';

type IdType = string | number;

type RoomNameLike = { roomName?: string } | string | number | null | undefined;

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
  jobPost?: number;
  scheduledAt?: string;
  type?: 'technical' | 'behavioral' | 'mixed';
  questionIds?: number[];
  questionGroup?: number;
  notes?: string;
}

export interface SubmitEvaluationInput {
  interview: number;
  attitudeScore?: number;
  professionalScore?: number;
  overallScore?: number;
  result?: 'passed' | 'failed' | 'pending';
  comments?: string;
  proposedSalary?: number;
}

/* ── Response Types ───────────────────────────────────────────────────── */

interface LiveKitTokenResponse {
  token: string;
  url?: string;
  serverUrl?: string;
  server_url?: string;
  roomName: string;
}

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

/* ── Service ──────────────────────────────────────────────────────────── */

const interviewService = {
  getSessions: (params: GetSessionsParams = {}): Promise<PaginatedResponse<InterviewSession>> => {
    const url = 'interview/web/sessions/';
    return httpRequest.get(url, { params }).then((res) => presignInObject(res)) as Promise<PaginatedResponse<InterviewSession>>;
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

  updateSessionStatus: (roomName: RoomNameLike, status: string): Promise<InterviewSession> => {
    const target =
      typeof roomName === 'object' && roomName ? roomName.roomName : roomName;

    const url = `interview/web/sessions/${target}/status/`;
    return httpRequest.patch(url, { status }).then((res) => presignInObject(res)) as Promise<InterviewSession>;
  },

  getLiveKitToken: (inviteToken: string): Promise<LiveKitTokenResponse> => {
    const url = `interview/web/sessions/invite/${inviteToken}/livekit-token/`;
    return httpRequest.get(url) as Promise<LiveKitTokenResponse>;
  },

  triggerAiEvaluation: (id: IdType): Promise<{ status: string }> => {
    const url = `interview/web/sessions/${id}/evaluate-ai/`;
    return httpRequest.post(url) as Promise<{ status: string }>;
  },

  submitEvaluation: (data: SubmitEvaluationInput): Promise<InterviewEvaluation> => {
    const url = 'interview/web/evaluations/';
    return httpRequest.post(url, data) as Promise<InterviewEvaluation>;
  },

  getEvaluations: (sessionId: IdType): Promise<PaginatedResponse<InterviewEvaluation>> => {
    const url = `interview/web/evaluations/`;
    return httpRequest.get(url, { params: { interview: sessionId } }) as Promise<PaginatedResponse<InterviewEvaluation>>;
  },

  getObserverToken: (sessionId: IdType): Promise<LiveKitTokenResponse & { mode: string }> => {
    const url = `interview/web/sessions/${sessionId}/observer-token/`;
    return httpRequest.post(url) as Promise<LiveKitTokenResponse & { mode: string }>;
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
