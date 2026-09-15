import { readFileSync } from 'fs';
import { join } from 'path';

describe('CustomControlBar & Action Buttons Loading Feedback State', () => {
  const aiLayoutSource = readFileSync(join(__dirname, '../AIInterviewLayout.tsx'), 'utf8');
  const candidateCardPanelSource = readFileSync(
    join(__dirname, '../../components/employers/InterviewLiveCandidateCard/InterviewLiveCandidateCardPanel.tsx'),
    'utf8',
  );
  const verificationFormSource = readFileSync(
    join(__dirname, '../../employerPages/VerificationPage/components/VerificationLegalProfileForm.tsx'),
    'utf8',
  );

  describe('CustomControlBar Hardware Controls', () => {
    it('declares micLoading, camLoading, and screenLoading states', () => {
      expect(aiLayoutSource).toContain('const [micLoading, setMicLoading] = useState(false);');
      expect(aiLayoutSource).toContain('const [camLoading, setCamLoading] = useState(false);');
      expect(aiLayoutSource).toContain('const [screenLoading, setScreenLoading] = useState(false);');
    });

    it('handles microphone toggle with loading feedback, async guard, and disabled state', () => {
      expect(aiLayoutSource).toContain('disabled={micLoading}');
      expect(aiLayoutSource).toContain('if (micLoading) return;');
      expect(aiLayoutSource).toContain('setMicLoading(true);');
      expect(aiLayoutSource).toContain('await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);');
      expect(aiLayoutSource).toContain('setMicLoading(false);');
      expect(aiLayoutSource).toContain('micLoading ? faSpinner : (isMicrophoneEnabled ? faMicrophone : faMicrophoneSlash)');
    });

    it('handles camera toggle with loading feedback, async guard, and disabled state', () => {
      expect(aiLayoutSource).toContain('disabled={camLoading}');
      expect(aiLayoutSource).toContain('if (camLoading) return;');
      expect(aiLayoutSource).toContain('setCamLoading(true);');
      expect(aiLayoutSource).toContain('await localParticipant.setCameraEnabled(!isCameraEnabled);');
      expect(aiLayoutSource).toContain('setCamLoading(false);');
      expect(aiLayoutSource).toContain('camLoading ? faSpinner : (isCameraEnabled ? faVideo : faVideoSlash)');
    });

    it('handles screen share toggle with loading feedback, async guard, and disabled state', () => {
      expect(aiLayoutSource).toContain('disabled={screenLoading}');
      expect(aiLayoutSource).toContain('if (screenLoading) return;');
      expect(aiLayoutSource).toContain('setScreenLoading(true);');
      expect(aiLayoutSource).toContain('await localParticipant.setScreenShareEnabled(!isScreenShareEnabled);');
      expect(aiLayoutSource).toContain('setScreenLoading(false);');
      expect(aiLayoutSource).toContain('screenLoading ? faSpinner : faDesktop');
    });

    it('handles session ending button with loading spinner and disabled state', () => {
      expect(aiLayoutSource).toContain('disabled={ending}');
      expect(aiLayoutSource).toContain('ending ? faSpinner : faPhoneSlash');
      expect(aiLayoutSource).toContain("ending ? t('controls.ending') : t('controls.end')");
    });
  });

  describe('ChatPanel AI Instruction & Message Submission', () => {
    it('displays CircularProgress startIcon and disables submit button when sending is active', () => {
      expect(aiLayoutSource).toContain('disabled={!chatDraft.trim() || sending}');
      expect(aiLayoutSource).toContain('startIcon={sending ? <CircularProgress size={14} color="inherit" /> : undefined}');
    });

    it('displays CircularProgress startIcon for takeover toggle button when isTakeoverSending', () => {
      expect(aiLayoutSource).toContain('startIcon={isTakeoverSending ? <CircularProgress size={14} color="inherit" /> : undefined}');
    });
  });

  describe('InterviewLiveCandidateCardPanel Action Buttons', () => {
    it('displays CircularProgress spinner on "Tham gia phòng" button while hrPresenceLoading', () => {
      expect(candidateCardPanelSource).toContain(
        'startIcon={hrPresenceLoading ? <CircularProgress size={15} color="inherit" /> : <MeetingRoomIcon sx={{ fontSize: 16 }} />}',
      );
    });

    it('displays CircularProgress spinner on "Kết thúc" button while isForceEnding', () => {
      expect(candidateCardPanelSource).toContain(
        'startIcon={isForceEnding ? <CircularProgress size={14} color="inherit" /> : <StopCircleIcon sx={{ fontSize: 16 }} />}',
      );
      expect(candidateCardPanelSource).toContain(
        'startIcon={isForceEnding ? <CircularProgress size={14} color="inherit" /> : <StopCircleIcon />}',
      );
    });
  });

  describe('VerificationLegalProfileForm Submit Button', () => {
    it('displays CircularProgress spinner in startIcon when loading is true', () => {
      expect(verificationFormSource).toContain(
        'startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}',
      );
    });
  });
});
