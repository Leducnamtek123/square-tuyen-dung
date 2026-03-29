import httpRequest from '../utils/httpRequest';
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
  candidateId?: number;
  jobPostId?: number;
  scheduledAt?: string;
  type?: 'ai' | 'live';
  roomName?: string;
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

export interface LiveKitTokenResponse {
  token: string;
  url: string;
  roomName: string;
}

/* ── Service ──────────────────────────────────────────────────────────── */

const interviewService = {
  getSessions: (params: GetSessionsParams = {}): Promise<PaginatedResponse<InterviewSession>> => {
    const url = 'interview/web/sessions/';
    return httpRequest.get(url, { params }) as Promise<PaginatedResponse<InterviewSession>>;
  },

  getSessionDetail: (id: IdType): Promise<InterviewSession> => {
    const url = `interview/web/sessions/${id}/`;
    return httpRequest.get(url) as Promise<InterviewSession>;
  },

  getSessionDetailByInviteToken: (inviteToken: string): Promise<InterviewSession> => {
    const url = `interview/web/sessions/invite/${inviteToken}/`;
    return httpRequest.get(url) as Promise<InterviewSession>;
  },

  scheduleSession: (data: ScheduleSessionInput): Promise<InterviewSession> => {
    const url = 'interview/web/sessions/';
    return httpRequest.post(url, data) as Promise<InterviewSession>;
  },

  updateSession: (id: IdType, data: Partial<ScheduleSessionInput>): Promise<InterviewSession> => {
    const url = `interview/web/sessions/${id}/`;
    return httpRequest.patch(url, data) as Promise<InterviewSession>;
  },

  deleteSession: (id: IdType): Promise<void> => {
    const url = `interview/web/sessions/${id}/`;
    return httpRequest.delete(url) as Promise<void>;
  },

  updateSessionStatus: (roomName: RoomNameLike, status: string): Promise<InterviewSession> => {
    const target =
      typeof roomName === 'object' && roomName ? roomName.roomName : roomName;

    const url = `interview/web/sessions/${target}/status/`;
    return httpRequest.patch(url, { status }) as Promise<InterviewSession>;
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
};

export default interviewService;
