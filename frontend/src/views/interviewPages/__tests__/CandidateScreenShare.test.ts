import { readFileSync } from 'fs';
import { join } from 'path';

describe('Candidate Screen Share in AIInterviewLayout', () => {
  const source = readFileSync(join(__dirname, '../AIInterviewLayout.tsx'), 'utf8');

  it('subscribes to Track.Source.ScreenShare with real-time room event updates', () => {
    expect(source).toContain('source: Track.Source.ScreenShare');
    expect(source).not.toContain('updateOnlyOn: []');
  });

  it('identifies candidateScreenTrack and passes screenTrackRef to AIParticipantTile', () => {
    expect(source).toContain('candidateScreenTrack');
    expect(source).toContain('screenTrackRef={candidateScreenTrack}');
    expect(source).toContain('screenTrackRef?: TrackReferenceOrPlaceholder');
  });

  it('renders active screen share with object-contain and non-mirrored video in AIParticipantTile', () => {
    expect(source).toContain('hasActiveScreen');
    expect(source).toContain('trackRef={screenTrackRef as any}');
    expect(source).toContain('object-contain');
  });

  it('renders floating picture-in-picture webcam for candidate while screen is sharing', () => {
    expect(source).toContain('w-32 h-24 sm:w-44 sm:h-28 rounded-xl');
    expect(source).toContain("isSelf ? 'scale-x-[-1]' : ''");
  });

  it('provides accessible in-tile stop sharing button for candidate', () => {
    expect(source).toContain('localParticipant.setScreenShareEnabled(false)');
    expect(source).toContain("t('controls.stopScreenShare')");
  });
});
