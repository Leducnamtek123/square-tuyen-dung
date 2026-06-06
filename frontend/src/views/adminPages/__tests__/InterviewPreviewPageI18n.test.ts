import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../InterviewPreviewPage.tsx'), 'utf8');

const fixedKeys = [
  'pages.interviewPreview.steps.waiting.label',
  'pages.interviewPreview.steps.waiting.desc',
  'pages.interviewPreview.steps.preflight.label',
  'pages.interviewPreview.steps.preflight.desc',
  'pages.interviewPreview.steps.connected.label',
  'pages.interviewPreview.steps.connected.desc',
  'pages.interviewPreview.waiting.title',
  'pages.interviewPreview.waiting.description',
  'pages.interviewPreview.waiting.start',
  'pages.interviewPreview.waiting.scheduled',
  'pages.interviewPreview.preflight.title',
  'pages.interviewPreview.preflight.description',
  'pages.interviewPreview.preflight.microphone',
  'pages.interviewPreview.preflight.cameraPreview',
  'pages.interviewPreview.actions.back',
  'pages.interviewPreview.actions.joinRoom',
  'pages.interviewPreview.connected.aiInterviewer',
  'pages.interviewPreview.connected.chatTitle',
  'pages.interviewPreview.connected.chatMessages.aiGreeting',
  'pages.interviewPreview.connected.chatMessages.candidateReady',
  'pages.interviewPreview.connected.chatMessages.reactQuestion',
  'pages.interviewPreview.connected.chatMessages.reactExperience',
  'pages.interviewPreview.connected.messageInput',
  'pages.interviewPreview.connected.observerNotice',
  'pages.interviewPreview.connected.you',
  'pages.interviewPreview.connected.end',
  'pages.interviewPreview.aria.turnMicrophoneOff',
  'pages.interviewPreview.aria.turnMicrophoneOn',
  'pages.interviewPreview.aria.turnCameraOff',
  'pages.interviewPreview.aria.turnCameraOn',
  'pages.interviewPreview.aria.shareScreen',
  'pages.interviewPreview.aria.closeChat',
  'pages.interviewPreview.aria.openChat',
  'pages.interviewPreview.header.eyebrow',
  'pages.interviewPreview.header.title',
  'pages.interviewPreview.header.previewMode',
  'pages.interviewPreview.status.waiting',
  'pages.interviewPreview.status.preflight',
  'pages.interviewPreview.status.connected',
  'pages.interviewPreview.session.position',
  'pages.interviewPreview.session.candidate',
  'pages.interviewPreview.session.room',
  'pages.interviewPreview.actions.jumpToRoom',
  'pages.interviewPreview.footerNote',
];

describe('InterviewPreviewPage i18n', () => {
  it('does not hard-code fixed English copy in the preview page source', () => {
    expect(source).not.toContain('>Admin Preview<');
    expect(source).not.toContain('>Interview Flow, Fake Data<');
    expect(source).not.toContain('>Preview Mode<');
    expect(source).not.toContain('>Microphone<');
    expect(source).not.toContain('Camera preview');
    expect(source).not.toContain('name="AI Interviewer"');
    expect(source).not.toContain('>Chat<');
    expect(source).not.toContain("'Turn microphone off'");
    expect(source).not.toContain("'Turn microphone on'");
    expect(source).not.toContain("'Turn camera off'");
    expect(source).not.toContain("'Turn camera on'");
    expect(source).not.toContain('aria-label="Share screen"');
    expect(source).not.toContain("'Close chat'");
    expect(source).not.toContain("'Open chat'");
    expect(source).not.toContain('Xin chào!');
    expect(source).not.toContain('Dạ, tôi sẵn sàng');
    expect(source).not.toContain('Bạn có thể mô tả kinh nghiệm');
    expect(source).not.toContain('Tôi đã có 3 năm kinh nghiệm');
  });

  it('uses admin locale keys for fixed copy', () => {
    fixedKeys.forEach((key) => {
      expect(source).toContain(`'${key}'`);
    });
  });

  it('shows the localized preview route instead of a hard-coded canonical route', () => {
    expect(source).toContain('localizeRoutePath');
    expect(source).toContain('ROUTES.ADMIN.INTERVIEW_PREVIEW');
    expect(source).toContain('i18n.language');
    expect(source).not.toContain('>/admin/interview-preview<');
  });

  it('uses the same candidate sender value for alignment and bubble styling', () => {
    expect(source).toContain("m.from === 'candidate' ? 'bg-cyan-500/15 border border-cyan-400/15'");
    expect(source).not.toContain("m.from === 'Candidate'");
  });

  it('has Vietnamese and English locale entries for fixed copy', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../i18n/locales/vi/admin.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../i18n/locales/en/admin.json'), 'utf8'));

    fixedKeys.forEach((key) => {
      const path = key.replace('pages.', '').split('.');
      const readKey = (locale: Record<string, unknown>) => path.reduce<unknown>(
        (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
        locale.pages
      );

      expect(readKey(vi)).toEqual(expect.any(String));
      expect(readKey(en)).toEqual(expect.any(String));
    });
  });
});
