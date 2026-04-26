import { ParticipantKind } from 'livekit-client';
import { getParticipantRole, sanitizeInterviewText } from '../livekitParticipant';

describe('livekitParticipant helpers', () => {
  it('classifies agent participant from kind', () => {
    const participant = {
      kind: ParticipantKind.AGENT,
      identity: 'agent-1',
      name: 'AI',
      attributes: {},
    } as any;

    expect(getParticipantRole(participant)).toBe('agent');
  });

  it('classifies employer from identity prefix', () => {
    const participant = {
      kind: ParticipantKind.STANDARD,
      identity: 'employer-42',
      name: 'HR',
      attributes: {},
    } as any;

    expect(getParticipantRole(participant)).toBe('employer');
  });

  it('detects agent from lk.agent.state attribute', () => {
    const participant = {
      kind: ParticipantKind.STANDARD,
      identity: 'assistant-1',
      name: 'Assistant',
      attributes: { 'lk.agent.state': 'listening' },
    } as any;

    expect(getParticipantRole(participant)).toBe('agent');
  });

  it('falls back to guest role by default', () => {
    const participant = {
      kind: ParticipantKind.STANDARD,
      identity: 'user-9',
      name: 'Unknown',
      attributes: {},
    } as any;

    expect(getParticipantRole(participant)).toBe('guest');
  });

  it('sanitizes function payloads and code blocks from transcript text', () => {
    const raw = 'xin chao <function=name>{"a":1}</function> ```json {"x":1} ```  the end';
    expect(sanitizeInterviewText(raw)).toBe('xin chao the end');
  });
});
