type SessionStatusLike = {
  status?: string | null;
};

export const LIVE_INTERVIEW_STATUSES = new Set([
  'in_progress',
  'calibration',
  'connecting',
  'active',
  'interrupted',
]);

export const normalizeInterviewStatus = (status?: string | null) =>
  (status || '').trim().toLowerCase();

export const isLiveInterviewSession = (session: SessionStatusLike) =>
  LIVE_INTERVIEW_STATUSES.has(normalizeInterviewStatus(session.status));

export const getLiveInterviewSessions = <T extends SessionStatusLike>(sessions: readonly T[] = []) =>
  sessions.filter(isLiveInterviewSession);

export const countLiveInterviewSessions = (sessions: readonly SessionStatusLike[] = []) =>
  getLiveInterviewSessions(sessions).length;
