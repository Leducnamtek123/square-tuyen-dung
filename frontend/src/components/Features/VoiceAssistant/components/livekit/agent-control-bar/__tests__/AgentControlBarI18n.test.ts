import { readFileSync } from 'fs';
import { join } from 'path';

const readSource = (file: string) => readFileSync(join(__dirname, '..', file), 'utf8');

const chatInputSource = readSource('chat-input.tsx');
const trackDeviceSelectSource = readSource('track-device-select.tsx');
const trackToggleSource = readSource('track-toggle.tsx');
const agentControlBarSource = readSource('agent-control-bar.tsx');

const localeKeys = [
  'voiceAi.chat.messageInput',
  'voiceAi.chat.placeholder',
  'voiceAi.chat.send',
  'voiceAi.chat.sending',
  'voiceAi.chat.sendMessage',
  'voiceAi.chat.sendingMessage',
  'voiceAi.devices.select',
  'voiceAi.devices.microphone',
  'voiceAi.devices.camera',
  'voiceAi.devices.speaker',
  'voiceAi.aria.controls',
  'voiceAi.aria.toggleMicrophone',
  'voiceAi.aria.toggleCamera',
  'voiceAi.aria.toggleScreenShare',
  'voiceAi.aria.toggleTranscript',
  'voiceAi.aria.toggleGeneric',
  'voiceAi.controls.endCall',
  'voiceAi.controls.endShort',
];

describe('VoiceAssistant agent control bar i18n', () => {
  it('does not hard-code chat input copy', () => {
    [
      'aria-label="Message"',
      'placeholder="Type a message..."',
      "'Sending message'",
      "'Send message'",
      "'Sending...'",
      "'Send'",
    ].forEach((literal) => {
      expect(chatInputSource).not.toContain(literal);
    });

    [
      'voiceAi.chat.messageInput',
      'voiceAi.chat.placeholder',
      'voiceAi.chat.sendingMessage',
      'voiceAi.chat.sendMessage',
      'voiceAi.chat.sending',
      'voiceAi.chat.send',
    ].forEach((key) => {
      expect(chatInputSource).toContain(key);
    });
  });

  it('does not hard-code device selector labels', () => {
    expect(trackDeviceSelectSource).not.toContain('Select a ${kind}');
    expect(trackDeviceSelectSource).toContain('voiceAi.devices.select');
    expect(trackDeviceSelectSource).toContain('voiceAi.devices.microphone');
    expect(trackDeviceSelectSource).toContain('voiceAi.devices.camera');
    expect(trackDeviceSelectSource).toContain('voiceAi.devices.speaker');
  });

  it('does not hard-code control bar aria labels or end-call labels', () => {
    [
      'Voice assistant controls',
      'Toggle microphone',
      'Toggle camera',
      'Toggle screen share',
      'Toggle transcript',
      'END CALL',
      '>END<',
    ].forEach((literal) => {
      expect(agentControlBarSource).not.toContain(literal);
    });

    [
      'voiceAi.aria.controls',
      'voiceAi.aria.toggleMicrophone',
      'voiceAi.aria.toggleCamera',
      'voiceAi.aria.toggleScreenShare',
      'voiceAi.aria.toggleTranscript',
      'voiceAi.controls.endCall',
      'voiceAi.controls.endShort',
    ].forEach((key) => {
      expect(agentControlBarSource).toContain(key);
    });
  });

  it('uses localized fallback aria for generic track toggles', () => {
    expect(trackToggleSource).not.toContain('Toggle ${source}');
    expect(trackToggleSource).toContain('voiceAi.aria.toggleGeneric');
  });

  it('has Vietnamese and English locale entries for fixed control-bar copy', () => {
    const en = JSON.parse(readFileSync(join(process.cwd(), 'src/i18n/locales/en/interview.json'), 'utf8'));
    const vi = JSON.parse(readFileSync(join(process.cwd(), 'src/i18n/locales/vi/interview.json'), 'utf8'));
    const readKey = (locale: Record<string, unknown>, key: string) => key.split('.').reduce<unknown>(
      (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
      locale
    );

    localeKeys.forEach((key) => {
      expect(readKey(en, key)).toEqual(expect.any(String));
      expect(readKey(vi, key)).toEqual(expect.any(String));
    });
  });
});
