import { Participant, ParticipantKind } from 'livekit-client';

const ROLE_HINTS = ['agent', 'interviewer'];
const ROLE_ATTRIBUTE_KEYS = ['role', 'participant_role', 'user_role', 'livekit_role'];

export function isLiveKitAgentIdentity(identity?: string | null): boolean {
  if (!identity) {
    return false;
  }

  const normalized = identity.toLowerCase();
  return ROLE_HINTS.some((hint) => normalized.includes(hint));
}

export function isLiveKitAgentParticipant(participant?: Participant | null): boolean {
  if (!participant) {
    return false;
  }

  if (participant.isAgent || participant.kind === ParticipantKind.AGENT) {
    return true;
  }

  const haystack = [
    participant.identity,
    participant.name,
    participant.metadata,
    ...Object.values(participant.attributes ?? {}),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (ROLE_HINTS.some((hint) => haystack.includes(hint))) {
    return true;
  }

  return ROLE_ATTRIBUTE_KEYS.some((key) => {
    const value = participant.attributes?.[key]?.toLowerCase();
    return value === 'agent' || value === 'interviewer';
  });
}
