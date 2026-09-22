import { readFileSync } from 'fs';
import { join } from 'path';
import employerAiSettingService, {
  DEFAULT_EMPLOYER_AI_SETTINGS,
  DEFAULT_AVATAR_ACTIONS,
  AVATAR_ACTION_METAS,
  PRESET_HR_PERSONAS,
} from '@/services/employerAiSettingService';
import avatarService, { DEFAULT_CHARACTERS } from '@/services/avatarService';
import {
  DEFAULT_CHARACTER_ACTIONS,
  resolveActionVideoUrl,
  type AvatarAction,
} from '@/views/interviewPages/components/avatar/avatarStates';

describe('Task 3 & 4 Real-Time Talking Head AI HR Integration Suite', () => {
  describe('EmployerAiSettings Extension (Task 3)', () => {
    it('provides default avatar actions for 5 canonical clips', () => {
      const actions = Object.keys(DEFAULT_AVATAR_ACTIONS) as AvatarAction[];
      expect(actions).toEqual(['idle', 'nod', 'thinking', 'wave', 'thanks_wave']);

      for (const action of actions) {
        expect(DEFAULT_AVATAR_ACTIONS[action]).toContain(action);
        expect(DEFAULT_AVATAR_ACTIONS[action]).toMatch(/\.mp4$/);
      }
    });

    it('contains 5 action metadata items with valid Vietnamese descriptions without parentheses', () => {
      expect(AVATAR_ACTION_METAS.length).toBe(5);
      for (const meta of AVATAR_ACTION_METAS) {
        expect(meta.labelVi).not.toContain('(');
        expect(meta.labelVi).not.toContain(')');
        expect(meta.descriptionVi).not.toContain('(');
        expect(meta.descriptionVi).not.toContain(')');
      }
    });

    it('provides 3 standard Vietnamese HR Persona presets with proper STAR guidance and word limits', () => {
      expect(PRESET_HR_PERSONAS.length).toBe(3);
      const presetIds = PRESET_HR_PERSONAS.map((p) => p.id);
      expect(presetIds).toEqual(['friendly', 'professional', 'challenger']);

      const friendly = PRESET_HR_PERSONAS.find((p) => p.id === 'friendly');
      expect(friendly?.systemPromptTemplate).toContain('{job_title}');
      expect(friendly?.systemPromptTemplate).toContain('{candidate_name}');
      expect(friendly?.systemPromptTemplate).toContain('dưới 25 từ');

      const professional = PRESET_HR_PERSONAS.find((p) => p.id === 'professional');
      expect(professional?.systemPromptTemplate).toContain('STAR');
      expect(professional?.systemPromptTemplate).toContain('dưới 25 từ');

      const challenger = PRESET_HR_PERSONAS.find((p) => p.id === 'challenger');
      expect(challenger?.systemPromptTemplate).toContain('dưới 30 từ');

      // Check no parentheses in persona names or descriptions
      for (const p of PRESET_HR_PERSONAS) {
        expect(p.nameVi).not.toContain('(');
        expect(p.nameVi).not.toContain(')');
        expect(p.taglineVi).not.toContain('(');
        expect(p.taglineVi).not.toContain(')');
        expect(p.descriptionVi).not.toContain('(');
        expect(p.descriptionVi).not.toContain(')');
      }
    });

    it('sets default employer AI settings with ng_c_linh and professional persona', () => {
      expect(DEFAULT_EMPLOYER_AI_SETTINGS.activeCharacterId).toBe('ng_c_linh');
      expect(DEFAULT_EMPLOYER_AI_SETTINGS.hrPersonaPreset).toBe('professional');
      expect(DEFAULT_EMPLOYER_AI_SETTINGS.avatarActions?.idle).toBe(DEFAULT_AVATAR_ACTIONS.idle);
      expect(DEFAULT_EMPLOYER_AI_SETTINGS.customSystemPrompt).toContain('STAR');
    });

    it('resolves active character ID and action URLs correctly', () => {
      expect(employerAiSettingService.resolveActiveCharacterId()).toBe('ng_c_linh');
      expect(employerAiSettingService.resolveAvatarActionUrl('idle')).toBe('/assets/avatars/ng_c_linh/actions/idle.mp4');
      expect(employerAiSettingService.resolveAvatarActionUrl('wave')).toBe('/assets/avatars/ng_c_linh/actions/wave.mp4');
      expect(employerAiSettingService.getHrPersonaPreset('challenger')?.id).toBe('challenger');
    });
  });

  describe('Avatar Service & Fallback Contract (Task 3)', () => {
    it('returns default character catalog with 5 actions', async () => {
      const chars = await avatarService.getCharacters();
      expect(chars.length).toBeGreaterThanOrEqual(1);
      const ngcLinh = chars.find((c) => c.id === 'ng_c_linh');
      expect(ngcLinh).toBeDefined();
      expect(ngcLinh?.actions.length).toBe(5);
    });

    it('returns graceful fallback on render lipsync when offline', async () => {
      const res = await avatarService.renderLipsync({
        audio_url: 'https://test.com/audio.wav',
        avatar_id: 'ng_c_linh',
        base_action: 'idle',
      });
      expect(res.status).toBeDefined();
      expect(res.video_url).toContain('.mp4');
      expect(res.duration_sec).toBeGreaterThan(0);
    });

    it('provides action video url resolver', () => {
      const url = avatarService.getActionVideoUrl('ng_c_linh', 'wave');
      expect(url).toBe('/assets/avatars/ng_c_linh/actions/wave.mp4');
    });
  });

  describe('Dual-Buffering Action State Machine (Task 4)', () => {
    it('maps character action paths for ng_c_linh', () => {
      expect(DEFAULT_CHARACTER_ACTIONS.ng_c_linh.idle).toBe('/assets/avatars/ng_c_linh/actions/idle.mp4');
      expect(DEFAULT_CHARACTER_ACTIONS.ng_c_linh.nod).toBe('/assets/avatars/ng_c_linh/actions/nod.mp4');
      expect(DEFAULT_CHARACTER_ACTIONS.ng_c_linh.thinking).toBe('/assets/avatars/ng_c_linh/actions/thinking.mp4');
      expect(DEFAULT_CHARACTER_ACTIONS.ng_c_linh.wave).toBe('/assets/avatars/ng_c_linh/actions/wave.mp4');
      expect(DEFAULT_CHARACTER_ACTIONS.ng_c_linh.thanks_wave).toBe('/assets/avatars/ng_c_linh/actions/thanks_wave.mp4');
    });

    it('resolves action video URLs correctly with custom overrides', () => {
      expect(resolveActionVideoUrl('wave', 'ng_c_linh')).toBe('/assets/avatars/ng_c_linh/actions/wave.mp4');
      expect(resolveActionVideoUrl('idle', 'ng_c_linh', { idle: '/custom/path/idle.mp4' })).toBe('/custom/path/idle.mp4');
    });
  });

  describe('UI Compliance & Typography Standards', () => {
    const vietnameseCharRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

    it('ensures ActionVideosManager contains no parentheses in Vietnamese prose and no gradients', () => {
      const compPath = join(__dirname, '../ActionVideosManager.tsx');
      const source = readFileSync(compPath, 'utf8');

      expect(source).not.toContain('linear-gradient');
      expect(source).not.toContain('bg-gradient');

      const stringLiterals = source.match(/(["'`])(?:(?=(\\?))\2[\s\S])*?\1/g) || [];
      const vietnameseWithParens = stringLiterals.filter(
        (str) => vietnameseCharRegex.test(str) && /[()]/.test(str)
      );
      expect(vietnameseWithParens).toEqual([]);
    });

    it('ensures HrPersonaSelector contains no parentheses in Vietnamese prose and no gradients', () => {
      const compPath = join(__dirname, '../HrPersonaSelector.tsx');
      const source = readFileSync(compPath, 'utf8');

      expect(source).not.toContain('linear-gradient');
      expect(source).not.toContain('bg-gradient');

      const stringLiterals = source.match(/(["'`])(?:(?=(\\?))\2[\s\S])*?\1/g) || [];
      const vietnameseWithParens = stringLiterals.filter(
        (str) => vietnameseCharRegex.test(str) && /[()]/.test(str)
      );
      expect(vietnameseWithParens).toEqual([]);
    });

    it('ensures InterviewAvatar CSS module defines stage container and dual buffering video classes', () => {
      const cssPath = join(__dirname, '../../../../interviewPages/components/avatar/InterviewAvatarVideo.module.css');
      const cssSource = readFileSync(cssPath, 'utf8');

      expect(cssSource).toContain('.stageContainer');
      expect(cssSource).toContain('.stageIdle');
      expect(cssSource).toContain('.stageSpeak');
      expect(cssSource).toContain('0.12s');
      expect(cssSource).toContain('z-index: 2');
      expect(cssSource).toContain('z-index: 3');
    });
  });
});
