import { readFileSync } from 'fs';
import { join } from 'path';

describe('AIInterviewLayout i18n', () => {
  it('does not hard-code fallback text for fixed live room copy', () => {
    const source = readFileSync(join(__dirname, '../AIInterviewLayout.tsx'), 'utf8');
    const lines = source.split(/\r?\n/);
    const keys = [
      'controls.end',
      'controls.ending',
      'controls.muteMicrophone',
      'controls.startScreenShare',
      'controls.stopScreenShare',
      'controls.turnCameraOff',
      'controls.turnCameraOn',
      'controls.unmuteMicrophone',
      'liveRoom.chat.aiControlMode',
      'liveRoom.chat.aiControlPlaceholder',
      'liveRoom.chat.aiControlSend',
      'liveRoom.chat.chatMode',
      'liveRoom.chat.close',
      'liveRoom.chat.open',
      'liveRoom.chat.subtitle',
      'liveRoom.participants.observer',
    ];

    for (const key of keys) {
      const matchingLines = lines.filter((line) => line.includes(`t('${key}'`));

      expect(matchingLines).not.toHaveLength(0);
      for (const line of matchingLines) {
        expect(line).not.toMatch(new RegExp(`t\\('${key.replaceAll('.', '\\.')}'\\s*,\\s*['"]`));
      }
    }
  });
});
