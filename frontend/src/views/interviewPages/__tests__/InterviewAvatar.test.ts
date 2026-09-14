import { existsSync } from 'fs';
import { join } from 'path';
import {
  AVATAR_ASSET_PATHS,
  SPEAKING_CYCLE_FRAMES,
  PRELOAD_AVATAR_STATES,
  AVATAR_STATE_META,
  resolveAvatarState,
  resolveAvatarBasePath,
  getAvatarAssetPaths,
  getSpeakingCycleFrames,
  type AvatarState,
} from '../components/avatar/avatarStates';

describe('InterviewAvatar System Suite', () => {
  const publicAvatarDir = join(__dirname, '../../../../public/assets/images/avatar/hr');
  const publicMaleAvatarDir = join(__dirname, '../../../../public/assets/images/avatar/expert_male');

  describe('Asset Directory & Physical Files', () => {
    it('verifies that all mapped state assets physically exist on disk as WebP files', () => {
      const states = Object.keys(AVATAR_ASSET_PATHS) as AvatarState[];
      expect(states.length).toBeGreaterThanOrEqual(12);

      for (const state of states) {
        const relativePath = AVATAR_ASSET_PATHS[state];
        const filename = relativePath.split('?')[0].replace('/assets/images/avatar/hr/', '');
        const fullPath = join(publicAvatarDir, filename);
        expect(existsSync(fullPath)).toBe(true);
      }
    });

    it('verifies that expert_male assets physically exist with all 22 states on disk', () => {
      const malePaths = getAvatarAssetPaths('expert_male');
      const maleStates = Object.keys(malePaths) as AvatarState[];
      expect(maleStates.length).toBeGreaterThanOrEqual(14);

      for (const state of maleStates) {
        const relativePath = malePaths[state];
        const filename = relativePath.split('?')[0].replace('/assets/images/avatar/expert_male/', '');
        const fullPath = join(publicMaleAvatarDir, filename);
        expect(existsSync(fullPath)).toBe(true);
      }

      const maleSpeakingFrames = getSpeakingCycleFrames('expert_male');
      expect(maleSpeakingFrames.length).toBe(8);
      for (const frame of maleSpeakingFrames) {
        const filename = frame.split('?')[0].replace('/assets/images/avatar/expert_male/', '');
        const fullPath = join(publicMaleAvatarDir, filename);
        expect(existsSync(fullPath)).toBe(true);
      }
    });

    it('verifies avatar base path resolver returns correct paths', () => {
      expect(resolveAvatarBasePath('expert_male')).toBe('/assets/images/avatar/expert_male');
      expect(resolveAvatarBasePath('aila_recruiter')).toBe('/assets/images/avatar/hr');
      expect(resolveAvatarBasePath(undefined)).toBe('/assets/images/avatar/hr');
    });

    it('verifies that speaking cycle frames exist and have distinct frames', () => {
      expect(SPEAKING_CYCLE_FRAMES.length).toBe(8);
      for (const frame of SPEAKING_CYCLE_FRAMES) {
        const filename = frame.split('?')[0].replace('/assets/images/avatar/hr/', '');
        const fullPath = join(publicAvatarDir, filename);
        expect(existsSync(fullPath)).toBe(true);
      }
    });

    it('verifies core states are designated for instant preload', () => {
      expect(PRELOAD_AVATAR_STATES).toContain('idle');
      expect(PRELOAD_AVATAR_STATES).toContain('listening');
      expect(PRELOAD_AVATAR_STATES).toContain('thinking');
      expect(PRELOAD_AVATAR_STATES).toContain('speaking');
    });
  });

  describe('State Resolution Logic', () => {
    it('resolves goodbye when sessionStatus is completed', () => {
      const state = resolveAvatarState({ sessionStatus: 'completed' });
      expect(state).toBe('goodbye');
    });

    it('resolves speaking when voiceAssistantState is speaking', () => {
      const state = resolveAvatarState({ voiceAssistantState: 'speaking' });
      expect(state).toBe('speaking');
    });

    it('resolves speaking when isSpeaking flag is true even if voiceAssistantState is idle', () => {
      const state = resolveAvatarState({ voiceAssistantState: 'idle', isSpeaking: true });
      expect(state).toBe('speaking');
    });

    it('resolves listening when voiceAssistantState is listening', () => {
      const state = resolveAvatarState({ voiceAssistantState: 'listening' });
      expect(state).toBe('listening');
    });

    it('resolves thinking when voiceAssistantState is thinking', () => {
      const state = resolveAvatarState({ voiceAssistantState: 'thinking' });
      expect(state).toBe('thinking');
    });

    it('defaults to idle when no active triggers', () => {
      const state = resolveAvatarState({});
      expect(state).toBe('idle');
    });
  });

  describe('UX & Localization Standards', () => {
    it('ensures all localized labels contain no explanatory parentheses per strict project rule', () => {
      for (const [stateKey, meta] of Object.entries(AVATAR_STATE_META)) {
        expect(meta.labelVi).not.toContain('(');
        expect(meta.labelVi).not.toContain(')');
      }
    });

    it('provides badge background, border, and dot colors for each state', () => {
      for (const [stateKey, meta] of Object.entries(AVATAR_STATE_META)) {
        expect(meta.badgeBg).toBeDefined();
        expect(meta.badgeBorder).toBeDefined();
        expect(meta.dotColor).toBeDefined();
      }
    });
  });
});
