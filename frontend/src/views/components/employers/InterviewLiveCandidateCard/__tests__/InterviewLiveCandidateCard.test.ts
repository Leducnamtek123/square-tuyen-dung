import { readFileSync } from 'fs';
import { join } from 'path';

describe('InterviewLiveCandidateCard Component & Real-time LiveKit Connection', () => {
  const cardPath = join(__dirname, '../../InterviewLiveCandidateCard.tsx');
  const panelPath = join(__dirname, '../InterviewLiveCandidateCardPanel.tsx');
  const viLocalePath = join(__dirname, '../../../../../i18n/locales/vi/employer.json');

  const cardSource = readFileSync(cardPath, 'utf8');
  const panelSource = readFileSync(panelPath, 'utf8');
  const viLocale = JSON.parse(readFileSync(viLocalePath, 'utf8'));

  it('handles live connection state with LiveKit token resolution', () => {
    expect(cardSource).toContain('resolveLiveKitServerUrl');
    expect(cardSource).toContain('getSafeLiveKitUrl');
    expect(cardSource).toContain('interviewService');
  });

  it('renders presence controls and panel for live candidate room', () => {
    expect(cardSource).toContain('InterviewLiveCandidateCardPanel');
    expect(cardSource).toContain('ACTIVE_STATUSES');
  });

  it('polishes header with avatar, line-clamp, integrated LIVE badge with elapsed timer, and clean copy action without exposing raw hashes', () => {
    expect(cardSource).toContain('Avatar');
    expect(cardSource).toContain('textOverflow: \'ellipsis\'');
    expect(cardSource).toContain('whiteSpace: \'nowrap\'');
    expect(cardSource).toContain('livePillPulse');
    expect(cardSource).toContain('<span>LIVE</span>');
    expect(cardSource).toContain('ElapsedTimer');
    expect(cardSource).toContain('handleCopyRoom');
    expect(cardSource).not.toContain('session.roomName.replace(/^interview-/, \'#\')');
  });

  it('displays LIVE FEED instead of STUDIO FEED in the panel telemetry viewport', () => {
    expect(panelSource).toContain("'LIVE FEED'");
    expect(panelSource).not.toContain("'STUDIO FEED'");
  });

  it('uses Tham gia phòng as the primary action label in panel and Vietnamese locale', () => {
    expect(panelSource).toContain("t('employer:interviewLive.candidateCard.joinPresence', 'Tham gia phòng')");
    expect(viLocale.interviewLive.candidateCard.joinPresence).toBe('Tham gia phòng');
    expect(viLocale.interviewLive.candidateCard.presenceTitle).toBe('Tham gia phòng');
  });

  it('renders clean standby state with Đang chờ tín hiệu... and telemetry status chips', () => {
    expect(panelSource).toContain("t('employer:interviewLive.candidateCard.waitingSignal', 'Đang chờ tín hiệu...')");
    expect(panelSource).toContain('Camera: Chờ mở');
    expect(panelSource).toContain('Micrô: Chờ mở');
    expect(panelSource).toContain('Phòng AI: Sẵn sàng');
    expect(viLocale.interviewLive.candidateCard.waitingSignal).toBe('Đang chờ tín hiệu...');
  });

  it('provides Secondary "Phóng to" and Destructive "Kết thúc" action buttons', () => {
    expect(panelSource).toContain("t('employer:interviewLive.candidateCard.maximize', 'Phóng to')");
    expect(panelSource).toContain("t('employer:interviewLive.candidateCard.end', 'Kết thúc')");
    expect(viLocale.interviewLive.candidateCard.maximize).toBe('Phóng to');
    expect(viLocale.interviewLive.candidateCard.end).toBe('Kết thúc');
  });
});

