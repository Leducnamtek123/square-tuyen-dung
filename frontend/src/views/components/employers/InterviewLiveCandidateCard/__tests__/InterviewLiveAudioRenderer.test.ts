import { readFileSync } from 'fs';
import { join } from 'path';

const count = (source: string, pattern: string) =>
  (source.match(new RegExp(pattern, 'g')) || []).length;

describe('employer realtime interview audio playback', () => {
  it('renders remote room audio in live candidate card observer surfaces', () => {
    const panelSource = readFileSync(
      join(__dirname, '../InterviewLiveCandidateCardPanel.tsx'),
      'utf8',
    );
    const presenceSource = readFileSync(
      join(__dirname, '../InterviewLiveCandidateCardPresence.tsx'),
      'utf8',
    );
    const liveLayoutSource = readFileSync(
      join(__dirname, '../../../../interviewPages/AIInterviewLayout.tsx'),
      'utf8',
    );

    expect(panelSource).toContain('RoomAudioRenderer');
    expect(count(panelSource, '<RoomAudioRenderer />')).toBeGreaterThanOrEqual(1);
    expect(liveLayoutSource).toContain('StartAudio');
    expect(presenceSource).toContain('RoomAudioRenderer');
    expect(count(presenceSource, '<RoomAudioRenderer />')).toBeGreaterThanOrEqual(1);
    expect(presenceSource).toContain('StartAudio');
  });

  it('renders remote room audio in interview detail HR presence mode', () => {
    const detailSource = readFileSync(
      join(__dirname, '../../InterviewDetailCard/index.tsx'),
      'utf8',
    );

    expect(detailSource).toContain('RoomAudioRenderer');
    expect(count(detailSource, '<RoomAudioRenderer />')).toBeGreaterThanOrEqual(1);
  });
});
