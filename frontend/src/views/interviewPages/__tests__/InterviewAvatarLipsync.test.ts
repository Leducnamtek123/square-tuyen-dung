import { readFileSync } from 'fs';
import { join } from 'path';

describe('InterviewAvatar Full HD Video & Lipsync Event Architecture', () => {
  const avatarSource = readFileSync(
    join(__dirname, '../components/avatar/InterviewAvatar.tsx'),
    'utf8'
  );
  const layoutSource = readFileSync(
    join(__dirname, '../AIInterviewLayout.tsx'),
    'utf8'
  );
  const sessionPageSource = readFileSync(
    join(__dirname, '../InterviewSessionPage.tsx'),
    'utf8'
  );

  describe('InterviewAvatar.tsx - Zero 2D Image Fallback & Full HD Video Rules', () => {
    it('completely removes AvatarImage import and usage', () => {
      expect(avatarSource).not.toContain("import { AvatarImage } from './AvatarImage';");
      expect(avatarSource).not.toContain('<AvatarImage');
    });

    it('removes videoFallbackActive state and never toggles 2D fallback image on error', () => {
      expect(avatarSource).not.toContain('videoFallbackActive');
      expect(avatarSource).not.toContain('setVideoFallbackActive');
    });

    it('supports all required Full HD gesture action videos', () => {
      expect(avatarSource).toContain('wave');
      expect(avatarSource).toContain('idle');
      expect(avatarSource).toContain('nod');
      expect(avatarSource).toContain('thinking');
      expect(avatarSource).toContain('thanks_wave');
    });

    it('handles lipsync video with audio and smooth transition back to idle on ended', () => {
      expect(avatarSource).toContain('activeLipsyncUrl');
      expect(avatarSource).toContain('handleSpeakEnded');
      expect(avatarSource).toContain('!hasSpecificLipsync');
      expect(avatarSource).toContain('isPip');
    });

    it('configures WebRTC transceivers with video first, audio second', () => {
      const videoTransceiverIdx = avatarSource.indexOf("pc.addTransceiver('video'");
      const audioTransceiverIdx = avatarSource.indexOf("pc.addTransceiver('audio'");
      expect(videoTransceiverIdx).toBeGreaterThan(0);
      expect(audioTransceiverIdx).toBeGreaterThan(videoTransceiverIdx);
    });

    it('listens for LiveKit room data messages on topic interview_avatar_event', () => {
      expect(avatarSource).toContain("const AVATAR_EVENT_TOPIC = 'interview_avatar_event'");
      expect(avatarSource).toContain('RoomEvent.DataReceived');
    });
  });

  describe('AIInterviewLayout.tsx - Room Contract & Character Props Forwarding', () => {
    it('imports employerAiSettingService and declares AVATAR_EVENT_TOPIC', () => {
      expect(layoutSource).toContain("import employerAiSettingService from '@/services/employerAiSettingService';");
      expect(layoutSource).toContain("const AVATAR_EVENT_TOPIC = 'interview_avatar_event';");
    });

    it('accepts characterId and avatarActions props with fallback to employerAiSettingService', () => {
      expect(layoutSource).toContain('effectiveCharacterId = propCharacterId || savedSettings.activeCharacterId');
      expect(layoutSource).toContain('effectiveAvatarActions = propAvatarActions || savedSettings.avatarActions');
    });

    it('manages lipsyncVideoUrl state and listens to interview_avatar_event', () => {
      expect(layoutSource).toContain('const [lipsyncVideoUrl, setLipsyncVideoUrl] = useState<string | null>(null);');
      expect(layoutSource).toContain('setLipsyncVideoUrl(vUrl);');
    });

    it('passes characterId, avatarActions, and lipsyncVideoUrl to AIParticipantTile / InterviewAvatar', () => {
      expect(layoutSource).toContain('characterId={effectiveCharacterId}');
      expect(layoutSource).toContain('avatarActions={effectiveAvatarActions}');
      expect(layoutSource).toContain('lipsyncVideoUrl={lipsyncVideoUrl}');
    });
  });

  describe('InterviewSessionPage.tsx - Root Interview Room Wiring', () => {
    it('passes characterId and avatarActions to AIInterviewLayout in ActiveInterviewRoom', () => {
      expect(sessionPageSource).toContain("characterId={savedSettings.activeCharacterId || 'ng_c_linh'}");
      expect(sessionPageSource).toContain('avatarActions={savedSettings.avatarActions}');
    });
  });
});
