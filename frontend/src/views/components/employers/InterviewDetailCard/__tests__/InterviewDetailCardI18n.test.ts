import { readFileSync } from 'fs';
import { join } from 'path';

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const expectNoDefaultValue = (source: string, key: string) => {
  const call = source.match(new RegExp(`t\\('${escapeRegex(key)}'[\\s\\S]*?\\)`))?.[0] || '';

  expect(call).toContain(`t('${key}'`);
  expect(call).not.toContain('defaultValue');
};

const expectNoStringFallback = (source: string, key: string) => {
  const lines = source
    .split(/\r?\n/)
    .filter((line) => line.includes(`t('${key}'`));

  expect(lines).not.toHaveLength(0);
  for (const line of lines) {
    expect(line).not.toMatch(new RegExp(`t\\('${escapeRegex(key)}'\\s*,\\s*['"]`));
  }
};

describe('InterviewDetailCard i18n', () => {
  it('does not hard-code fallback text for fixed interview detail messages', () => {
    const indexSource = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
    const aiSource = readFileSync(join(__dirname, '../InterviewAiEvaluationCard.tsx'), 'utf8');
    const headerSource = readFileSync(join(__dirname, '../InterviewDetailHeader.tsx'), 'utf8');
    const hrFormSource = readFileSync(join(__dirname, '../InterviewHrEvaluationForm.tsx'), 'utf8');
    const recordingSource = readFileSync(join(__dirname, '../InterviewRecordingCard.tsx'), 'utf8');
    const liveTranscriptSource = readFileSync(join(__dirname, '../InterviewTranscriptPanelLive.tsx'), 'utf8');

    expectNoDefaultValue(indexSource, 'interview:interviewDetail.messages.confirmForceEnd');
    expectNoDefaultValue(indexSource, 'interview:interviewDetail.messages.forceEndSuccess');
    expectNoDefaultValue(aiSource, 'interviewDetail.messages.aiAnalyzing');
    expectNoDefaultValue(aiSource, 'interviewDetail.label.aiOverallQuality');
    expectNoDefaultValue(headerSource, 'interview:interviewDetail.status.interruptedResume');
    expectNoDefaultValue(headerSource, 'interview:interviewDetail.messages.interruptedResumeHint');
    expectNoDefaultValue(headerSource, 'interview:interviewDetail.tooltips.observeHidden');
    expectNoDefaultValue(hrFormSource, 'interviewDetail.actions.commentsPlaceholder');
    expectNoDefaultValue(recordingSource, 'interview:interviewDetail.messages.recordingPending');
    expectNoDefaultValue(recordingSource, 'interview:interviewDetail.messages.recordingPendingDesc');
    expectNoStringFallback(liveTranscriptSource, 'liveRoom.participants.observer');
  });
});
