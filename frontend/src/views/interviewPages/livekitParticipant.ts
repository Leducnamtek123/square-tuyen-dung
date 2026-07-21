import { Participant, ParticipantKind } from 'livekit-client';

export type ParticipantRole = 'agent' | 'employer' | 'candidate' | 'observer' | 'guest';

const ROLE_HINTS = ['agent', 'interviewer'];
const ROLE_ATTRIBUTE_KEYS = ['role', 'participant_role', 'user_role', 'livekit_role'];
const AGENT_ATTRIBUTE_KEYS = ['lk.agent.state', 'agent_state', 'agent-status', 'agent_status'];

function parseParticipantMetadata(metadata?: string | null): Record<string, unknown> {
  if (!metadata) {
    return {};
  }

  try {
    const parsed = JSON.parse(metadata);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

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

  if (AGENT_ATTRIBUTE_KEYS.some((key) => typeof participant.attributes?.[key] === 'string')) {
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

export function getParticipantRole(participant?: Participant | null): ParticipantRole {
  const identity = participant?.identity?.toLowerCase?.() ?? '';
  const name = participant?.name?.toLowerCase?.() ?? '';
  const metadata = participant?.metadata?.toLowerCase?.() ?? '';
  const attributes = Object.values(participant?.attributes ?? {}).reduce<string[]>((values, value) => {
    if (value) values.push(String(value).toLowerCase());
    return values;
  }, []).join(' ');
  const haystack = `${identity} ${name} ${metadata} ${attributes}`.trim();

  if (participant?.isAgent || participant?.kind === ParticipantKind.AGENT || isLiveKitAgentParticipant(participant)) {
    return 'agent';
  }

  if (identity.startsWith('employer-') || haystack.includes('employer') || haystack.includes('admin')) {
    return 'employer';
  }

  if (identity.startsWith('observer-') || haystack.includes('observer')) {
    return 'observer';
  }

  if (identity.startsWith('candidate-') || haystack.includes('candidate')) {
    return 'candidate';
  }

  return 'guest';
}

export function getParticipantCompanyName(participant?: Participant | null): string | null {
  if (!participant) {
    return null;
  }

  const companyFromAttributes =
    participant.attributes?.company_name ||
    participant.attributes?.companyName ||
    participant.attributes?.company;
  if (typeof companyFromAttributes === 'string' && companyFromAttributes.trim()) {
    return companyFromAttributes.trim();
  }

  const metadata = parseParticipantMetadata(participant.metadata);
  const companyFromMetadata = metadata.company_name || metadata.companyName || metadata.company;
  if (typeof companyFromMetadata === 'string' && companyFromMetadata.trim()) {
    return companyFromMetadata.trim();
  }

  return null;
}

export function sanitizeInterviewText(value: string): string {
  if (!value) {
    return '';
  }

  return value
    .replace(/<function=[^>]+>[\s\S]*?<\/function>/gi, ' ')
    .replace(/<\/?function[^>]*>/gi, ' ')
    .replace(/\{\s*"stage_name"\s*:\s*"[^"]+"\s*\}/gi, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
