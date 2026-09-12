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

export const AVATAR_ASSET_PATHS: Record<AvatarState, string> = {
  idle: `${AVATAR_ASSET_BASE_PATH}/idle.webp`,
  listening: `${AVATAR_ASSET_BASE_PATH}/listening.webp`,
  thinking: `${AVATAR_ASSET_BASE_PATH}/thinking.webp`,
  processing: `${AVATAR_ASSET_BASE_PATH}/processing.webp`,
  speaking: `${AVATAR_ASSET_BASE_PATH}/speaking_01.webp`,
  encouraging: `${AVATAR_ASSET_BASE_PATH}/encouraging.webp`,
  curious: `${AVATAR_ASSET_BASE_PATH}/curious.webp`,
  serious: `${AVATAR_ASSET_BASE_PATH}/serious.webp`,
  happy: `${AVATAR_ASSET_BASE_PATH}/happy.webp`,
  impressed: `${AVATAR_ASSET_BASE_PATH}/impressed.webp`,
  surprised: `${AVATAR_ASSET_BASE_PATH}/surprised.webp`,
  agree: `${AVATAR_ASSET_BASE_PATH}/agree.webp`,
  goodbye: `${AVATAR_ASSET_BASE_PATH}/goodbye.webp`,
  blink: `${AVATAR_ASSET_BASE_PATH}/blink.webp`,
};

export const SPEAKING_CYCLE_FRAMES: readonly string[] = [
  `${AVATAR_ASSET_BASE_PATH}/speaking_01.webp`,
  `${AVATAR_ASSET_BASE_PATH}/speaking_02.webp`,
  `${AVATAR_ASSET_BASE_PATH}/speaking_03.webp`,
  `${AVATAR_ASSET_BASE_PATH}/speaking_04.webp`,
  `${AVATAR_ASSET_BASE_PATH}/speaking_05.webp`,
  `${AVATAR_ASSET_BASE_PATH}/speaking_06.webp`,
  `${AVATAR_ASSET_BASE_PATH}/speaking_07.webp`,
  `${AVATAR_ASSET_BASE_PATH}/speaking_08.webp`,
];

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

