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

export const isLiveInterviewSession = (session: SessionStatusLike) => {
  const statusValid = LIVE_INTERVIEW_STATUSES.has(normalizeInterviewStatus(session.status));
  if (!statusValid) return false;

  const sessionTime =
    (session as any).startTime ||
    (session as any).create_at ||
    (session as any).createdAt ||
    (session as any).scheduledAt;

  if (sessionTime) {
    const timeMs = new Date(sessionTime).getTime();
    if (!Number.isNaN(timeMs)) {
      const hoursDiff = (Date.now() - timeMs) / (1000 * 3600);
      if (hoursDiff >= 12) {
        return false;
      }
    }
  }

  return true;
};

export const getLiveInterviewSessions = <T extends SessionStatusLike>(sessions: readonly T[] = []) =>
  sessions.filter(isLiveInterviewSession);

export const countLiveInterviewSessions = (sessions: readonly SessionStatusLike[] = []) =>
  getLiveInterviewSessions(sessions).length;
