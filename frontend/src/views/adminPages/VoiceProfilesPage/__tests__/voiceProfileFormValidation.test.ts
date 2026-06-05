import fs from 'fs';
import path from 'path';

import {
  getVoiceProfileFormValidationErrors,
  type VoiceProfileFormValidationData,
} from '../voiceProfileFormValidation';

const validClonedForm: VoiceProfileFormValidationData = {
  name: 'Vietnamese interviewer',
  language: 'vi',
  voiceType: 'cloned',
  presetVoiceId: '',
  consentConfirmed: true,
};

const validPresetForm: VoiceProfileFormValidationData = {
  name: 'Preset interviewer',
  language: 'vi',
  voiceType: 'preset',
  presetVoiceId: 'vietnam_female_01',
  consentConfirmed: false,
};

describe('getVoiceProfileFormValidationErrors', () => {
  it('accepts values that match the backend VoiceProfile model contract', () => {
    expect(getVoiceProfileFormValidationErrors(validClonedForm)).toEqual({});
    expect(getVoiceProfileFormValidationErrors(validPresetForm)).toEqual({});
  });

  it('rejects missing or overlong common fields before submitting', () => {
    expect(
      getVoiceProfileFormValidationErrors({
        ...validClonedForm,
        name: '   ',
        language: '   ',
      }),
    ).toEqual({
      name: 'nameRequired',
      language: 'languageRequired',
    });

    expect(
      getVoiceProfileFormValidationErrors({
        ...validClonedForm,
        name: 'A'.repeat(161),
        language: 'v'.repeat(17),
      }),
    ).toEqual({
      name: 'nameMax',
      language: 'languageMax',
    });
  });

  it('rejects preset or cloned values that backend validation would reject', () => {
    expect(
      getVoiceProfileFormValidationErrors({
        ...validPresetForm,
        presetVoiceId: '   ',
      }),
    ).toEqual({
      presetVoiceId: 'presetVoiceIdRequired',
    });

    expect(
      getVoiceProfileFormValidationErrors({
        ...validPresetForm,
        presetVoiceId: 'p'.repeat(256),
      }),
    ).toEqual({
      presetVoiceId: 'presetVoiceIdMax',
    });

    expect(
      getVoiceProfileFormValidationErrors({
        ...validClonedForm,
        consentConfirmed: false,
      }),
    ).toEqual({
      consentConfirmed: 'consentRequired',
    });
  });

  it('wires validation into create and edit Voice Profile dialogs', () => {
    const pageSource = fs.readFileSync(
      path.join(__dirname, '../index.tsx'),
      'utf8',
    );

    expect(pageSource).toContain('getVoiceProfileFormValidationErrors');
    expect(pageSource).toContain('hasCreateValidationErrors');
    expect(pageSource).toContain('hasEditValidationErrors');
    expect(pageSource).toContain("getVoiceProfileValidationText(createValidationErrors, 'name')");
    expect(pageSource).toContain("getVoiceProfileValidationText(createValidationErrors, 'language')");
    expect(pageSource).toContain("getVoiceProfileValidationText(createValidationErrors, 'presetVoiceId')");
    expect(pageSource).toContain("getVoiceProfileValidationText(editValidationErrors, 'name')");
    expect(pageSource).toContain('disabled={hasCreateValidationErrors || createMutation.isPending}');
    expect(pageSource).toContain('disabled={hasEditValidationErrors || updateMutation.isPending}');
  });
});
