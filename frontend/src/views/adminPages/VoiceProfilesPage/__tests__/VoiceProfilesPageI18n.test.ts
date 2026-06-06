import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

const fixedKeys = [
  'pages.voiceProfiles.title',
  'pages.voiceProfiles.newVoice',
  'pages.voiceProfiles.loadError',
  'pages.voiceProfiles.table.name',
  'pages.voiceProfiles.table.type',
  'pages.voiceProfiles.table.status',
  'pages.voiceProfiles.table.samples',
  'pages.voiceProfiles.table.grants',
  'pages.voiceProfiles.table.actions',
  'pages.voiceProfiles.table.empty',
  'pages.voiceProfiles.actions.edit',
  'pages.voiceProfiles.actions.sample',
  'pages.voiceProfiles.actions.grant',
  'pages.voiceProfiles.actions.delete',
  'pages.voiceProfiles.actions.cancel',
  'pages.voiceProfiles.actions.create',
  'pages.voiceProfiles.actions.createAndUpload',
  'pages.voiceProfiles.actions.save',
  'pages.voiceProfiles.actions.close',
  'pages.voiceProfiles.actions.generateAndPlay',
  'pages.voiceProfiles.actions.upload',
  'pages.voiceProfiles.dialogs.createTitle',
  'pages.voiceProfiles.dialogs.editTitle',
  'pages.voiceProfiles.dialogs.deleteTitle',
  'pages.voiceProfiles.dialogs.testTitle',
  'pages.voiceProfiles.dialogs.sampleTitle',
  'pages.voiceProfiles.dialogs.grantTitle',
  'pages.voiceProfiles.fields.name',
  'pages.voiceProfiles.fields.description',
  'pages.voiceProfiles.fields.type',
  'pages.voiceProfiles.fields.language',
  'pages.voiceProfiles.fields.presetVoiceId',
  'pages.voiceProfiles.fields.status',
  'pages.voiceProfiles.fields.exactTranscript',
  'pages.voiceProfiles.fields.testSentence',
  'pages.voiceProfiles.fields.grantTo',
  'pages.voiceProfiles.fields.company',
  'pages.voiceProfiles.fields.jobPost',
  'pages.voiceProfiles.voiceTypes.cloned',
  'pages.voiceProfiles.voiceTypes.preset',
  'pages.voiceProfiles.statuses.draft',
  'pages.voiceProfiles.statuses.processing',
  'pages.voiceProfiles.statuses.ready',
  'pages.voiceProfiles.statuses.disabled',
  'pages.voiceProfiles.statuses.failed',
  'pages.voiceProfiles.grantTargets.company',
  'pages.voiceProfiles.grantTargets.job',
  'pages.voiceProfiles.messages.cloneHint',
  'pages.voiceProfiles.messages.sampleHint',
  'pages.voiceProfiles.messages.permissionConfirm',
  'pages.voiceProfiles.messages.deleteConfirm',
  'pages.voiceProfiles.messages.defaultVoice',
  'pages.voiceProfiles.messages.chooseAudio',
  'pages.voiceProfiles.messages.createSampleAria',
  'pages.voiceProfiles.messages.uploadSampleAria',
  'pages.voiceProfiles.messages.generatedPreviewAria',
  'pages.voiceProfiles.messages.testActionAria',
  'pages.voiceProfiles.messages.defaultTestSentence',
  'pages.voiceProfiles.validation.cloneSampleRequired',
  'pages.voiceProfiles.validation.voiceNotReady',
  'pages.voiceProfiles.validation.testSentenceRequired',
  'pages.voiceProfiles.validation.sampleRequired',
  'pages.voiceProfiles.validation.companyRequired',
  'pages.voiceProfiles.validation.jobRequired',
  'pages.voiceProfiles.toast.createWithSampleSuccess',
  'pages.voiceProfiles.toast.createSuccess',
  'pages.voiceProfiles.toast.createError',
  'pages.voiceProfiles.toast.updateSuccess',
  'pages.voiceProfiles.toast.updateError',
  'pages.voiceProfiles.toast.deleteSuccess',
  'pages.voiceProfiles.toast.deleteError',
  'pages.voiceProfiles.toast.previewError',
  'pages.voiceProfiles.toast.sampleSuccess',
  'pages.voiceProfiles.toast.sampleError',
  'pages.voiceProfiles.toast.grantSuccess',
  'pages.voiceProfiles.toast.grantError',
];

describe('VoiceProfilesPage i18n', () => {
  it('does not hard-code fixed English copy in the page source', () => {
    [
      'Voice Profiles',
      'New Voice',
      'Could not load voice profiles.',
      'No voice profiles yet.',
      'New Voice Profile',
      'Edit Voice Profile',
      'Delete Voice Profile',
      'Test Voice',
      'Upload Voice Sample',
      'Grant Voice Access',
      'Voice profile and sample created.',
      'Voice profile created.',
      'Could not create voice profile.',
      'Voice profile updated.',
      'Could not update voice profile.',
      'Voice profile deleted.',
      'Could not delete voice profile.',
      'Could not generate voice preview.',
      'Voice sample uploaded.',
      'Could not upload voice sample.',
      'Voice access granted.',
      'Could not grant voice access.',
      'Audio file and exact transcript are required for cloned voices.',
      'Voice must be ready before testing.',
      'Enter a sentence to test this voice.',
      'Audio file and transcript are required.',
      'Select a company.',
      'Select a job post.',
      'Upload a clean mp3/wav sample and paste the exact transcript for cloning.',
      'Use 10-30 seconds of clean speech and paste the exact transcript.',
      'I confirm we have permission to clone and use this voice.',
      'Use as default voice for this target',
      'Choose mp3/wav',
      'Create & Upload',
      'Generate & Play',
      'Generated voice preview',
    ].forEach((text) => {
      expect(source).not.toContain(text);
    });
  });

  it('uses admin locale keys for fixed copy', () => {
    fixedKeys.forEach((key) => {
      expect(source).toContain(`'${key}'`);
    });
  });

  it('has Vietnamese and English locale entries for fixed copy', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/admin.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/admin.json'), 'utf8'));

    fixedKeys.forEach((key) => {
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
