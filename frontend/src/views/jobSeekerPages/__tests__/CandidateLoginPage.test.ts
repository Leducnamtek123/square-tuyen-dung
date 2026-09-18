import { readFileSync } from 'fs';
import { join } from 'path';

describe('JobSeeker CandidateLoginPage & VoiceAiInterviewRedirectPage Navigation', () => {
  const loginPath = join(__dirname, '../CandidateLoginPage/index.tsx');
  const redirectPath = join(__dirname, '../VoiceAiInterviewRedirectPage.tsx');

  const loginSource = readFileSync(loginPath, 'utf8');
  const redirectSource = readFileSync(redirectPath, 'utf8');

  it('CandidateLoginPage handles session input and routes to interview room', () => {
    expect(loginSource).toContain('ROUTES.JOBSEEKER_INTERVIEW.INTERVIEW_ROOM');
    expect(loginSource).toContain("push(`/${targetRoute.replace(':id', sessionId.trim())}`)");
    expect(loginSource).toContain('disabled={!sessionId.trim()}');
  });

  it('VoiceAiInterviewRedirectPage safely encodes session ID and redirects', () => {
    expect(redirectSource).toContain('encodeURIComponent');
    expect(redirectSource).toContain('ROUTES.JOBSEEKER_INTERVIEW.INTERVIEW_ROOM.replace(\':id\', safeId)');
    expect(redirectSource).toContain('window.location.replace(targetUrl)');
  });
});
