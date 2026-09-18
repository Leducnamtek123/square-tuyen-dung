import { readFileSync } from 'fs';
import { join } from 'path';

describe('AIInterviewLayout 3-Screen Layout & AI Takeover', () => {
  const source = readFileSync(join(__dirname, '../AIInterviewLayout.tsx'), 'utf8');

  it('declares 3 distinct participant tiles for candidate, agent, and employer', () => {
    expect(source).toContain('data-tour="interview-candidate"');
    expect(source).toContain('data-tour="interview-agent"');
    expect(source).toContain('data-tour="interview-employer"');
    expect(source).toContain("variant: 'agent' | 'candidate' | 'employer'");
  });

  it('renders 2 primary screens and places AI into a floating PiP corner when employer camera is active', () => {
    expect(source).toContain('isEmployerCameraActive');
    expect(source).toContain('isPip={true}');
    expect(source).toContain('grid-cols-1 gap-1.5 sm:gap-2 lg:grid-cols-2');
  });

  it('surfaces an accessible AI Takeover button on the main CustomControlBar for employers', () => {
    expect(source).toContain('isLocalEmployer && (');
    expect(source).toContain('onTakeoverToggle');
    expect(source).toContain("aria-label={t('liveRoom.chat.takeoverMode')}");
    expect(source).toContain("t('liveRoom.chat.takeoverAcquire')");
    expect(source).toContain("t('liveRoom.chat.takeoverRelease')");
    expect(source).toContain("t('liveRoom.chat.takeoverSending')");
  });

  it('displays AI paused and employer takeover indicators when takeover is active', () => {
    expect(source).toContain('AI TẠM DỪNG (NHÀ TUYỂN DỤNG ĐANG HỎI)');
    expect(source).toContain('ĐANG TIẾP QUẢN PHỎNG VẤN');
    expect(source).toContain('isTakeoverActive');
  });

  it('displays quick-action takeover toggle on observing bar', () => {
    expect(source).toContain('showObservingBar');
    expect(source).toContain('Bạn đang trực tiếp phỏng vấn (AI tạm dừng).');
    expect(source).toContain("sendTakeoverControl(takeoverActive ? 'release' : 'acquire')");
  });
});
