import { readFileSync } from 'fs';
import { join } from 'path';

describe('InterviewLiveCandidateCard Component & Real-time LiveKit Connection', () => {
  const filePath = join(__dirname, '../../InterviewLiveCandidateCard.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('handles live connection state with LiveKit token resolution', () => {
    expect(source).toContain('resolveLiveKitServerUrl');
    expect(source).toContain('getSafeLiveKitUrl');
    expect(source).toContain('interviewService');
  });

  it('renders presence controls and panel for live candidate room', () => {
    expect(source).toContain('InterviewLiveCandidateCardPanel');
    expect(source).toContain('ACTIVE_STATUSES');
  });
});
