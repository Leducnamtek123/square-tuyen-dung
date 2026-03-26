import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

type IdType = string | number;

type RoomNameLike = { roomName?: string } | string | number | null | undefined;

const interviewService = {
  getSessions: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'interview/web/sessions/';
    return httpRequest.get(url, { params });
  },

  getSessionDetail: (id: IdType): Promise<unknown> => {
    const url = `interview/web/sessions/${id}/`;
    return httpRequest.get(url);
  },

  getSessionDetailByInviteToken: (inviteToken: string): Promise<unknown> => {
    const url = `interview/web/sessions/invite/${inviteToken}/`;
    return httpRequest.get(url);
  },

  scheduleSession: (data: AnyRecord): Promise<unknown> => {
    const url = 'interview/web/sessions/';
    return httpRequest.post(url, data);
  },

  updateSessionStatus: (roomName: RoomNameLike, status: string): Promise<unknown> => {
    const target =
      typeof roomName === 'object' && roomName ? roomName.roomName : roomName;

    const url = `interview/web/sessions/${target}/status/`;
    return httpRequest.patch(url, { status });
  },

  // Backend exposes LiveKit token by invite token, not by session id

  getLiveKitToken: (inviteToken: string): Promise<unknown> => {
    const url = `interview/web/sessions/invite/${inviteToken}/livekit-token/`;
    return httpRequest.get(url);
  },

  getLiveKitTokenByInviteToken: (inviteToken: string): Promise<unknown> => {
    const url = `interview/web/sessions/invite/${inviteToken}/livekit-token/`;
    return httpRequest.get(url);
  },

  triggerAiEvaluation: (id: IdType): Promise<unknown> => {
    const url = `interview/web/sessions/${id}/evaluate-ai/`;
    return httpRequest.post(url);
  },

  submitEvaluation: (data: AnyRecord): Promise<unknown> => {
    const url = 'interview/web/evaluations/';
    return httpRequest.post(url, data);
  },

  getEvaluations: (sessionId: IdType): Promise<unknown> => {
    const url = `interview/web/evaluations/`;
    return httpRequest.get(url, { params: { interview: sessionId } });
  },
};

export default interviewService;
