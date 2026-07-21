import { buildInterviewSSEUrl } from '../useInterviewSSE';

describe('buildInterviewSSEUrl', () => {
  it('includes selected company context for EventSource requests', () => {
    const url = buildInterviewSSEUrl({
      apiBase: 'https://api.example.test/api/',
      sessionId: 44,
      token: 'token with spaces',
      activeCompanyId: 22,
    });

    expect(url).toBe(
      'https://api.example.test/api/interview/web/sessions/44/stream/?token=token%20with%20spaces&activeCompanyId=22',
    );
  });

  it('omits company context when there is no active company workspace', () => {
    const url = buildInterviewSSEUrl({
      apiBase: '/api',
      sessionId: 'session-7',
      token: 'abc',
      activeCompanyId: null,
    });

    expect(url).toBe('/api/interview/web/sessions/session-7/stream/?token=abc');
  });
});
