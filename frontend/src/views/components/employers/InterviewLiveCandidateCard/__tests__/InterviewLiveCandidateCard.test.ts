import { readFileSync } from 'fs';
import { join } from 'path';
import { formatElapsed } from '../InterviewLiveCandidateCardPresence';

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

  it('maintains 16:9 webcam aspect ratio and minHeight in Studio Viewport', () => {
    expect(panelSource).toContain("aspectRatio: '16/9'");
    expect(panelSource).toContain("minHeight: { xs: 240, sm: 280 }");
  });

  describe('formatElapsed timer calculation', () => {
    it('returns --:-- for empty or null startTime', () => {
      expect(formatElapsed(null)).toBe('--:--');
      expect(formatElapsed(undefined)).toBe('--:--');
      expect(formatElapsed('')).toBe('--:--');
      expect(formatElapsed('invalid-date')).toBe('--:--');
    });

    it('formats minutes and seconds under 1 hour correctly', () => {
      const base = new Date('2026-09-30T10:00:00Z').getTime();
      const after5m30s = base + (5 * 60 + 30) * 1000;
      expect(formatElapsed(new Date(base).toISOString(), after5m30s)).toBe('05:30');
    });

    it('formats hours, minutes, and seconds when >= 1 hour and < 8 hours', () => {
      const base = new Date('2026-09-30T10:00:00Z').getTime();
      const after1h15m20s = base + (1 * 3600 + 15 * 60 + 20) * 1000;
      expect(formatElapsed(new Date(base).toISOString(), after1h15m20s)).toBe('01:15:20');

      const after7h59m59s = base + (7 * 3600 + 59 * 60 + 59) * 1000;
      expect(formatElapsed(new Date(base).toISOString(), after7h59m59s)).toBe('07:59:59');
    });

    it('returns >8h (Quá hạn) when elapsed >= 8 hours, preventing massive minute anomalies like 22173:17', () => {
      const base = new Date('2026-09-30T10:00:00Z').getTime();
      const after8h = base + 8 * 3600 * 1000;
      expect(formatElapsed(new Date(base).toISOString(), after8h)).toBe('>8h (Quá hạn)');

      // A session from 15 days ago (previously showed 22173:17)
      const after15days = base + 15 * 24 * 3600 * 1000;
      expect(formatElapsed(new Date(base).toISOString(), after15days)).toBe('>8h (Quá hạn)');
      expect(formatElapsed(new Date(base).toISOString(), after15days)).not.toContain('22173:17');
    });
  });
});

