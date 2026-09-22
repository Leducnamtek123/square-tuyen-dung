import { readFileSync } from 'fs';
import { join } from 'path';

const indexSource = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
const voiceTabSource = readFileSync(join(__dirname, '../components/VoiceInterviewTab.tsx'), 'utf8');
const source = indexSource + '\n' + voiceTabSource;

const interviewAiKeys = [
  'pages.settings.interviewAi.pacingTitle',
  'pages.settings.interviewAi.pacingDescription',
  'pages.settings.interviewAi.preset.label',
  'pages.settings.interviewAi.preset.helper',
  'pages.settings.interviewAi.preset.options.balanced',
  'pages.settings.interviewAi.preset.options.natural',
  'pages.settings.interviewAi.preset.options.snappy',
  'pages.settings.interviewAi.preset.options.custom',
  'pages.settings.interviewAi.questionGap.label',
  'pages.settings.interviewAi.questionGap.helper',
  'pages.settings.interviewAi.silenceThreshold.label',
  'pages.settings.interviewAi.silenceThreshold.helper',
  'pages.settings.interviewAi.ttsTitle',
  'pages.settings.interviewAi.ttsDescription',
  'pages.settings.interviewAi.ttsSpeed.label',
  'pages.settings.interviewAi.ttsSpeed.helper',
];

describe('SettingsPage i18n', () => {
  it('uses admin locale keys for interview AI timing copy', () => {
    interviewAiKeys.forEach((key) => {
      expect(source).toContain(`'${key}'`);
    });
  });

  it('has Vietnamese and English locale entries for interview AI timing copy', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/admin.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/admin.json'), 'utf8'));

    interviewAiKeys.forEach((key) => {
      const path = key.replace('pages.', '').split('.');
      const readKey = (locale: Record<string, unknown>) => path.reduce<unknown>(
        (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
        locale.pages
      );

      expect(readKey(vi)).toEqual(expect.any(String));
      expect(readKey(en)).toEqual(expect.any(String));
    });
  });
});
