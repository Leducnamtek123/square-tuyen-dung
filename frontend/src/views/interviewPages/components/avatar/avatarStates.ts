export type AvatarState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'processing'
  | 'speaking'
  | 'encouraging'
  | 'curious'
  | 'serious'
  | 'happy'
  | 'impressed'
  | 'surprised'
  | 'agree'
  | 'goodbye'
  | 'blink';

export const AVATAR_ASSET_BASE_PATH = '/assets/images/avatar/hr';

export function resolveAvatarBasePath(avatarId?: string): string {
  if (avatarId === 'expert_male' || avatarId === 'male_03') {
    return '/assets/images/avatar/expert_male';
  }
  if (avatarId && (avatarId.startsWith('female_') || avatarId.startsWith('male_'))) {
    return `/assets/images/avatar/${avatarId}`;
  }
  return '/assets/images/avatar/hr';
}

export const AVATAR_ASSET_VERSION = '20260913_photoreal_v8_uniform';

export function getAvatarAssetPaths(avatarId?: string): Record<AvatarState, string> {
  const basePath = resolveAvatarBasePath(avatarId);
  const versionQuery = `?v=${AVATAR_ASSET_VERSION}`;
  return {
    idle: `${basePath}/idle.webp${versionQuery}`,
    listening: `${basePath}/listening.webp${versionQuery}`,
    thinking: `${basePath}/thinking.webp${versionQuery}`,
    processing: `${basePath}/processing.webp${versionQuery}`,
    speaking: `${basePath}/speaking_01.webp${versionQuery}`,
    encouraging: `${basePath}/encouraging.webp${versionQuery}`,
    curious: `${basePath}/curious.webp${versionQuery}`,
    serious: `${basePath}/serious.webp${versionQuery}`,
    happy: `${basePath}/happy.webp${versionQuery}`,
    impressed: `${basePath}/impressed.webp${versionQuery}`,
    surprised: `${basePath}/surprised.webp${versionQuery}`,
    agree: `${basePath}/agree.webp${versionQuery}`,
    goodbye: `${basePath}/goodbye.webp${versionQuery}`,
    blink: `${basePath}/blink.webp${versionQuery}`,
  };
}

export function getSpeakingCycleFrames(avatarId?: string): readonly string[] {
  const basePath = resolveAvatarBasePath(avatarId);
  const versionQuery = `?v=${AVATAR_ASSET_VERSION}`;
  return [
    `${basePath}/speaking_01.webp${versionQuery}`,
    `${basePath}/speaking_02.webp${versionQuery}`,
    `${basePath}/speaking_03.webp${versionQuery}`,
    `${basePath}/speaking_04.webp${versionQuery}`,
    `${basePath}/speaking_05.webp${versionQuery}`,
    `${basePath}/speaking_06.webp${versionQuery}`,
    `${basePath}/speaking_07.webp${versionQuery}`,
    `${basePath}/speaking_08.webp${versionQuery}`,
  ];
}

export const AVATAR_ASSET_PATHS: Record<AvatarState, string> = getAvatarAssetPaths('aila_recruiter');

export const SPEAKING_CYCLE_FRAMES: readonly string[] = getSpeakingCycleFrames('aila_recruiter');

export const PRELOAD_AVATAR_STATES: readonly AvatarState[] = [
  'idle',
  'listening',
  'thinking',
  'speaking',
  'blink',
];

export interface AvatarStateMeta {
  labelVi: string;
  badgeBg: string;
  badgeBorder: string;
  badgeColor: string;
  dotColor: string;
}

export const AVATAR_STATE_META: Record<AvatarState, AvatarStateMeta> = {
  idle: {
    labelVi: 'Sẵn sàng phỏng vấn',
    badgeBg: 'rgba(51, 65, 85, 0.45)',
    badgeBorder: 'rgba(71, 85, 105, 0.5)',
    badgeColor: '#cbd5e1',
    dotColor: '#94a3b8',
  },
  listening: {
    labelVi: 'Đang lắng nghe',
    badgeBg: 'rgba(14, 165, 233, 0.18)',
    badgeBorder: 'rgba(56, 189, 248, 0.45)',
    badgeColor: '#7dd3fc',
    dotColor: '#38bdf8',
  },
  thinking: {
    labelVi: 'Đang phân tích',
    badgeBg: 'rgba(168, 85, 247, 0.18)',
    badgeBorder: 'rgba(192, 132, 252, 0.45)',
    badgeColor: '#d8b4fe',
    dotColor: '#c084fc',
  },
  processing: {
    labelVi: 'Đang xử lý kết quả',
    badgeBg: 'rgba(234, 179, 8, 0.18)',
    badgeBorder: 'rgba(250, 204, 21, 0.45)',
    badgeColor: '#fde047',
    dotColor: '#eab308',
  },
  speaking: {
    labelVi: 'AI đang phát biểu',
    badgeBg: 'rgba(16, 185, 129, 0.18)',
    badgeBorder: 'rgba(52, 211, 153, 0.45)',
    badgeColor: '#6ee7b7',
    dotColor: '#10b981',
  },
  encouraging: {
    labelVi: 'Đang khích lệ bạn',
    badgeBg: 'rgba(244, 63, 94, 0.18)',
    badgeBorder: 'rgba(251, 113, 133, 0.45)',
    badgeColor: '#fda4af',
    dotColor: '#f43f5e',
  },
  curious: {
    labelVi: 'Muốn tìm hiểu thêm',
    badgeBg: 'rgba(59, 130, 246, 0.18)',
    badgeBorder: 'rgba(96, 165, 250, 0.45)',
    badgeColor: '#93c5fd',
    dotColor: '#3b82f6',
  },
  serious: {
    labelVi: 'Câu hỏi trọng tâm',
    badgeBg: 'rgba(99, 102, 241, 0.18)',
    badgeBorder: 'rgba(129, 140, 248, 0.45)',
    badgeColor: '#a5b4fc',
    dotColor: '#6366f1',
  },
  happy: {
    labelVi: 'Phản hồi tích cực',
    badgeBg: 'rgba(34, 197, 94, 0.18)',
    badgeBorder: 'rgba(74, 222, 128, 0.45)',
    badgeColor: '#86efac',
    dotColor: '#22c55e',
  },
  surprised: {
    labelVi: 'Điểm thú vị',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    badgeBorder: 'rgba(251, 191, 36, 0.45)',
    badgeColor: '#fde68a',
    dotColor: '#f59e0b',
  },
  impressed: {
    labelVi: 'Rất ấn tượng',
    badgeBg: 'rgba(16, 185, 129, 0.18)',
    badgeBorder: 'rgba(52, 211, 153, 0.45)',
    badgeColor: '#6ee7b7',
    dotColor: '#10b981',
  },
  agree: {
    labelVi: 'Đồng tình với bạn',
    badgeBg: 'rgba(20, 184, 166, 0.18)',
    badgeBorder: 'rgba(45, 212, 191, 0.45)',
    badgeColor: '#5eead4',
    dotColor: '#14b8a6',
  },
  goodbye: {
    labelVi: 'Cảm ơn bạn đã tham gia',
    badgeBg: 'rgba(59, 130, 246, 0.22)',
    badgeBorder: 'rgba(96, 165, 250, 0.5)',
    badgeColor: '#bfdbfe',
    dotColor: '#3b82f6',
  },
  blink: {
    labelVi: 'Sẵn sàng lắng nghe',
    badgeBg: 'rgba(2, 132, 199, 0.14)',
    badgeBorder: 'rgba(14, 165, 233, 0.35)',
    badgeColor: '#38bdf8',
    dotColor: '#0284c7',
  },
};

export interface ResolveAvatarStateOptions {
  voiceAssistantState?: string;
  isSpeaking?: boolean;
  sessionStatus?: string;
  contextHint?: string;
}

/**
 * Pure function mapping live session and audio cues to canonical AvatarState.
 */
export function resolveAvatarState({
  voiceAssistantState,
  isSpeaking = false,
  sessionStatus,
  contextHint,
}: ResolveAvatarStateOptions = {}): AvatarState {
  if (sessionStatus === 'completed') {
    return 'goodbye';
  }

  if (sessionStatus === 'processing') {
    return 'processing';
  }

  if (voiceAssistantState === 'speaking' || (isSpeaking && voiceAssistantState !== 'listening')) {
    return 'speaking';
  }

  if (voiceAssistantState === 'thinking') {
    return 'thinking';
  }

  if (voiceAssistantState === 'listening') {
    return 'listening';
  }

  if (contextHint === 'encouraging') return 'encouraging';
  if (contextHint === 'curious') return 'curious';
  if (contextHint === 'serious') return 'serious';
  if (contextHint === 'happy') return 'happy';
  if (contextHint === 'surprised') return 'surprised';
  if (contextHint === 'agree') return 'agree';

  return 'idle';
}

