import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../InterviewCreateCardForm.tsx'), 'utf8');

const fixedKeys = [
  'interviewCreateCard.label.aiVoice',
  'interviewCreateCard.label.autoDefaultVoice',
  'interviewCreateCard.label.defaultVoiceSuffix',
  'interviewCreateCard.helperText.voiceProfileAuto',
  'interviewCreateCard.loadingSelectedJobPost',
  'interviewCreateCard.missingSelectedJobPost',
  'interviewCreateCard.loadingSelectedCandidate',
  'interviewCreateCard.missingSelectedCandidate',
];

describe('InterviewCreateCardForm i18n', () => {
  it('does not hard-code visible English voice profile copy', () => {
    expect(source).not.toContain('label="AI voice"');
    expect(source).not.toContain('helperText="Leave auto to use the default voice granted for this job or company."');
    expect(source).not.toContain('<em>Auto/default voice</em>');
    expect(source).not.toContain("? ' (default)' : ''");
  });

  it('uses interview locale keys for voice profile copy', () => {
    [
      "t('interview:interviewCreateCard.label.aiVoice')",
      "t('interview:interviewCreateCard.label.autoDefaultVoice')",
      "t('interview:interviewCreateCard.label.defaultVoiceSuffix')",
      "t('interview:interviewCreateCard.helperText.voiceProfileAuto')",
    ].forEach((snippet) => {
      expect(source).toContain(snippet);
    });
  });

  it('keeps preselected async select values mounted while options load', () => {
    [
      'jobValueHasOption',
      'candidateValueHasOption',
      "t('interview:interviewCreateCard.loadingSelectedJobPost')",
      "t('interview:interviewCreateCard.missingSelectedJobPost'",
      "t('interview:interviewCreateCard.loadingSelectedCandidate')",
      "t('interview:interviewCreateCard.missingSelectedCandidate'",
    ].forEach((snippet) => {
      expect(source).toContain(snippet);
    });
  });

  it('has Vietnamese and English locale entries for voice profile copy', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../../i18n/locales/vi/interview.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../../i18n/locales/en/interview.json'), 'utf8'));

    fixedKeys.forEach((key) => {
      const path = key.split('.');
      const readKey = (locale: Record<string, unknown>) => path.reduce<unknown>(
        (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
        locale
      );

      expect(readKey(vi)).toEqual(expect.any(String));
      expect(readKey(en)).toEqual(expect.any(String));
    });
  });
});
