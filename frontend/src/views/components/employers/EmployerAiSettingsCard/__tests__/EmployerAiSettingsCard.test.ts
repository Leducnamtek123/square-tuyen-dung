import { readFileSync } from 'fs';
import { join } from 'path';
import {
  DEFAULT_EMPLOYER_AI_SETTINGS,
  PRESET_BACKGROUNDS,
  PRESET_AVATARS,
} from '@/services/employerAiSettingService';

describe('EmployerAiSettingsCard and AI Settings Suite', () => {
  const vietnameseCharRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

  it('contains valid preset configurations', () => {
    expect(PRESET_BACKGROUNDS.length).toBeGreaterThanOrEqual(4);
    expect(PRESET_AVATARS.length).toBeGreaterThanOrEqual(2);
    expect(DEFAULT_EMPLOYER_AI_SETTINGS.interviewerName).toBe('Trợ lý AI AILA');
  });

  it('ensures EmployerAiSettingsCard source code complies with UI standards and contains no parentheses in Vietnamese prose', () => {
    const cardPath = join(__dirname, '../index.tsx');
    const source = readFileSync(cardPath, 'utf8');

    // Verify key UI features
    expect(source).toContain('InterviewAvatar');
    expect(source).toContain('employerAiSettingService');
    expect(source).toContain('commonService.uploadFile');
    expect(source).toContain('isSpeakingTest');
    expect(source).toContain('toastMessages.success');

    // Verify buttons do not use gradient
    expect(source).not.toContain('linear-gradient');
    expect(source).not.toContain('bg-gradient');

    // Extract all string literals
    const stringLiterals = source.match(/(["'`])(?:(?=(\\?))\2[\s\S])*?\1/g) || [];
    const vietnameseStringsWithParentheses = stringLiterals.filter(
      (str) => vietnameseCharRegex.test(str) && /[()]/.test(str)
    );
    expect(vietnameseStringsWithParentheses).toEqual([]);

    // Extract all comments
    const commentLines = source.split('\n').filter((line) => line.trim().startsWith('//') || line.trim().startsWith('{/*'));
    const vietnameseCommentsWithParentheses = commentLines.filter(
      (comment) => vietnameseCharRegex.test(comment) && /[()]/.test(comment)
    );
    expect(vietnameseCommentsWithParentheses).toEqual([]);
  });

  it('ensures modular subcomponents comply with typography and constraint standards', () => {
    const subcomponents = [
      'AiStudioPreview.tsx',
      'AiIdentityCard.tsx',
      'AiVoiceSelector.tsx',
      'AiSpaceCard.tsx',
      'AiActionBar.tsx',
    ];

    for (const filename of subcomponents) {
      const filePath = join(__dirname, '..', filename);
      const source = readFileSync(filePath, 'utf8');

      // Check no gradient
      expect(source).not.toContain('linear-gradient');
      expect(source).not.toContain('bg-gradient');

      // Check no parentheses in Vietnamese prose
      const stringLiterals = source.match(/(["'`])(?:(?=(\\?))\2[\s\S])*?\1/g) || [];
      const badStrings = stringLiterals.filter(
        (str) => vietnameseCharRegex.test(str) && /[()]/.test(str)
      );
      expect(badStrings).toEqual([]);

      // Check no parentheses in Vietnamese comments
      const commentLines = source.split('\n').filter((line) => line.trim().startsWith('//') || line.trim().startsWith('{/*'));
      const badComments = commentLines.filter(
        (comment) => vietnameseCharRegex.test(comment) && /[()]/.test(comment)
      );
      expect(badComments).toEqual([]);
    }
  });

  it('verifies AiStudioPreview live lipsync contract and gesture testing', () => {
    const previewPath = join(__dirname, '../AiStudioPreview.tsx');
    const source = readFileSync(previewPath, 'utf8');

    expect(source).toContain('InterviewAvatar');
    expect(source).toContain('speakVideoUrl');
    expect(source).toContain('isSpeakingTest');
    expect(source).toContain('actionHint');
    expect(source).toContain('wave');
    expect(source).toContain('thanks_wave');
  });

  it('verifies AiIdentityCard interviewer character and persona configuration', () => {
    const identityPath = join(__dirname, '../AiIdentityCard.tsx');
    const source = readFileSync(identityPath, 'utf8');

    expect(source).toContain('interviewerName');
    expect(source).toContain('interviewerTitle');
    expect(source).toContain('ng_c_linh');
    expect(source).toContain('minh_tri');
    expect(source).toContain('HrPersonaSelector');
  });

  it('verifies AiVoiceSelector tts playback and live speaking state callback', () => {
    const voicePath = join(__dirname, '../AiVoiceSelector.tsx');
    const source = readFileSync(voicePath, 'utf8');

    expect(source).toContain('PRESET_VOICES');
    expect(source).toContain('aiService.tts');
    expect(source).toContain('onSpeakingStateChange');
    expect(source).toContain('onplay');
    expect(source).toContain('onended');
  });

  it('verifies AiSpaceCard background presets and upload file handling', () => {
    const spacePath = join(__dirname, '../AiSpaceCard.tsx');
    const source = readFileSync(spacePath, 'utf8');

    expect(source).toContain('PRESET_BACKGROUNDS');
    expect(source).toContain('commonService.uploadFile');
  });

  it('verifies AiActionBar save and reset triggers', () => {
    const barPath = join(__dirname, '../AiActionBar.tsx');
    const source = readFileSync(barPath, 'utf8');

    expect(source).toContain('onSave');
    expect(source).toContain('onReset');
    expect(source).toContain('isDirty');
  });

  it('guarantees proprietary branding without leaking internal technology names in UI', () => {
    const filesToAudit = [
      join(__dirname, '../index.tsx'),
      join(__dirname, '../AiStudioPreview.tsx'),
      join(__dirname, '../../InterviewScripts/InterviewScriptsManager.tsx'),
      join(__dirname, '../../InterviewScripts/InterviewScriptDrawer.tsx'),
      join(__dirname, '../../../../../services/avatarService.ts'),
    ];

    for (const filePath of filesToAudit) {
      const source = readFileSync(filePath, 'utf8');
      expect(source).not.toContain('LiveKit');
      expect(source).not.toContain('Wav2Lip');
    }

    const apiTabSource = readFileSync(join(__dirname, '../../../../adminPages/SettingsPage/components/ApiIntegrationTab.tsx'), 'utf8');
    expect(apiTabSource).not.toContain('Test LiveKit WebRTC');
    expect(apiTabSource).not.toContain('Test MinIO S3 Storage');
    expect(apiTabSource).not.toContain('Máy chủ LiveKit');
    expect(apiTabSource).not.toContain('Dịch vụ MinIO');
  });

  it('verifies interviewScripts menu item in EmployerMenu has no custom icon and uses standard bullet dot', () => {
    const menuPath = join(__dirname, '../../../../../layouts/components/employers/Sidebar/EmployerMenu.tsx');
    const source = readFileSync(menuPath, 'utf8');

    expect(source).not.toContain('PsychologyOutlinedIcon');
    // Ensure interviewScripts MenuItem does not specify an icon prop
    const match = source.match(/<MenuItem[^>]*text=\{t\('employer:sidebar\.interviewScripts'\)\}[^>]*\/>/);
    expect(match).not.toBeNull();
    expect(match![0]).not.toContain('icon=');
  });
});
