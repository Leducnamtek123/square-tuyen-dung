import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

type IdType = string | number;

type RoomNameLike = { roomName?: string } | string | number | null | undefined;

const unwrapData = (response: { data?: unknown } | unknown): unknown =>
  (response as { data?: unknown })?.data ?? response;

const interviewService = {
  getSessions: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'interview/web/sessions/';
    return httpRequest.get(url, { params }).then(unwrapData);
  },

  getSessionDetail: (id: IdType): Promise<unknown> => {
    const url = `interview/web/sessions/${id}/`;
    return httpRequest.get(url).then(unwrapData);
  },

  getSessionDetailByInviteToken: (inviteToken: string): Promise<unknown> => {
    const url = `interview/web/sessions/invite/${inviteToken}/`;
    return httpRequest.get(url).then(unwrapData);
  },

  scheduleSession: (data: AnyRecord): Promise<unknown> => {
    const url = 'interview/web/sessions/';
    return httpRequest.post(url, data).then(unwrapData);
  },

  updateSessionStatus: (roomName: RoomNameLike, status: string): Promise<unknown> => {
    const target =
      typeof roomName === 'object' && roomName ? roomName.roomName : roomName;

    const url = `interview/web/sessions/${target}/status/`;
    return httpRequest.patch(url, { status }).then(unwrapData);
  },

  // Backend exposes LiveKit token by invite token, not by session id

  getLiveKitToken: (inviteToken: string): Promise<unknown> => {
    const url = `interview/web/sessions/invite/${inviteToken}/livekit-token/`;
    return httpRequest.get(url).then(unwrapData);
  },

  getLiveKitTokenByInviteToken: (inviteToken: string): Promise<unknown> => {
    const url = `interview/web/sessions/invite/${inviteToken}/livekit-token/`;
    return httpRequest.get(url).then(unwrapData);
  },

  triggerAiEvaluation: (id: IdType): Promise<unknown> => {
    const url = `interview/web/sessions/${id}/evaluate-ai/`;
    return httpRequest.post(url).then(unwrapData);
  },

  submitEvaluation: (data: AnyRecord): Promise<unknown> => {
    const url = 'interview/web/evaluations/';
    return httpRequest.post(url, data).then(unwrapData);
  },

  getEvaluations: (sessionId: IdType): Promise<unknown> => {
    const url = `interview/web/evaluations/`;
    return httpRequest.get(url, { params: { interview: sessionId } }).then(unwrapData);
  },
};

export default interviewService;
