import { transformInterviewSession } from '../transformers';

describe('transformInterviewSession', () => {
  it('maps snake_case interview session payloads to frontend fields', () => {
    const session = transformInterviewSession({
      id: 18,
      room_name: 'room-18',
      invite_token: 'invite-18',
      candidate_name: 'Nguyen Van A',
      candidate_email: 'a@example.com',
      job_name: 'Frontend Developer',
      company_name: 'Square',
      scheduled_at: '2026-04-23T10:00:00Z',
      status: 'in_progress',
      type: 'live',
      recording_url: 'https://example.com/recording.mp4',
    });

    expect(session).not.toBeNull();
    expect(session?.id).toBe(18);
    expect(session?.roomName).toBe('room-18');
    expect(session?.inviteToken).toBe('invite-18');
    expect(session?.candidateName).toBe('Nguyen Van A');
    expect(session?.candidateEmail).toBe('a@example.com');
    expect(session?.jobName).toBe('Frontend Developer');
    expect(session?.companyName).toBe('Square');
    expect(session?.scheduledAt).toBe('2026-04-23T10:00:00Z');
    expect(session?.recordingUrl).toBe('https://example.com/recording.mp4');
  });
});
