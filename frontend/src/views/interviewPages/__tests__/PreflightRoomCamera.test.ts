import { readFileSync } from 'fs';
import { join } from 'path';

describe('PreflightRoom Camera and Hardware Management', () => {
  const preflightSource = readFileSync(join(__dirname, '../PreflightRoom.tsx'), 'utf8');
  const sessionPageSource = readFileSync(join(__dirname, '../InterviewSessionPage.tsx'), 'utf8');

  it('enumerates videoinput devices alongside audioinput devices', () => {
    expect(preflightSource).toContain("d.kind === 'videoinput'");
    expect(preflightSource).toContain('setVideoDevices(videoInputs)');
    expect(preflightSource).toContain('setSelectedVideoId');
  });

  it('handles camera errors gracefully with informative Vietnamese messages instead of silent toggle-off', () => {
    expect(preflightSource).toContain('NotReadableError');
    expect(preflightSource).toContain('device in use');
    expect(preflightSource).toContain('Camera đang bị ứng dụng khác');
    expect(preflightSource).toContain('NotAllowedError');
    expect(preflightSource).toContain('OverconstrainedError');
    expect(preflightSource).toContain('setCameraError(errorMsg)');
  });

  it('provides retry and turn off fallback buttons when camera encounters an error', () => {
    expect(preflightSource).toContain('onClick={() => void initVideoStream()}');
    expect(preflightSource).toContain('Thử lại');
    expect(preflightSource).toContain('Tắt camera & tiếp tục');
  });

  it('supports fallback constraints if high resolution 720p is rejected by hardware', () => {
    expect(preflightSource).toContain('width: { ideal: 1280 }');
    expect(preflightSource).toContain('OverconstrainedError');
    expect(preflightSource).toContain('video: baseConstraints.deviceId ? baseConstraints : true');
  });

  it('stops and releases camera and microphone tracks before calling onJoin', () => {
    expect(preflightSource).toContain('activeVideoTrackRef.current.stop()');
    expect(preflightSource).toContain('activeAudioStreamRef.current');
    expect(preflightSource).toContain('handleJoin');
    expect(preflightSource).toContain('data-testid="join-interview-room-btn"');
    expect(preflightSource).toContain('onClick={handleJoin}');
  });

  it('passes chosen cameraEnabled and device preferences to LiveKitRoom in InterviewSessionPage', () => {
    expect(sessionPageSource).toContain('set-media-config');
    expect(sessionPageSource).toContain('videoDeviceId?: string');
    expect(sessionPageSource).toContain('audioDeviceId?: string');
    expect(sessionPageSource).toContain('videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true');
  });
});
