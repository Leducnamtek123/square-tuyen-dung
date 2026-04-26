import { ParticipantKind } from 'livekit-client';
import { mapTranscriptions } from '../useInterviewMessages';

describe('mapTranscriptions', () => {
  it('maps local user to userTranscript, agent to agentTranscript, and non-agent remote to userTranscript', () => {
    const participants = [
      {
        kind: ParticipantKind.STANDARD,
        identity: 'candidate-1',
        name: 'Candidate',
        attributes: { role: 'candidate' },
      },
      {
        kind: ParticipantKind.AGENT,
        identity: 'agent-1',
        name: 'AI',
        attributes: { role: 'agent' },
      },
      {
        kind: ParticipantKind.STANDARD,
        identity: 'employer-1',
        name: 'Employer',
        attributes: { role: 'employer' },
      },
    ] as any;

    const transcriptions = [
      {
        text: 'toi la ung vien',
        participantInfo: { identity: 'candidate-1' },
        streamInfo: { id: 's1', timestamp: 1 },
      },
      {
        text: 'toi la ai',
        participantInfo: { identity: 'agent-1' },
        streamInfo: { id: 's2', timestamp: 2 },
      },
      {
        text: 'toi la nha tuyen dung',
        participantInfo: { identity: 'employer-1' },
        streamInfo: { id: 's3', timestamp: 3 },
      },
    ] as any;

    const messages = mapTranscriptions(transcriptions, 'candidate-1', participants as any);

    expect(messages).toHaveLength(3);
    expect(messages[0]?.type).toBe('userTranscript');
    expect(messages[1]?.type).toBe('agentTranscript');
    expect(messages[2]?.type).toBe('userTranscript');
    expect(messages[2]?.from?.identity).toBe('employer-1');
  });
});

