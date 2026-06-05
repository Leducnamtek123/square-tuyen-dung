import { readFileSync } from 'fs';
import { join } from 'path';

const expectNoDefaultValueForStatus = (source: string) => {
  const lines = source
    .split(/\r?\n/)
    .filter((line) => line.includes('interviewListCard.statuses.'));

  expect(lines).not.toHaveLength(0);
  for (const line of lines) {
    expect(line).not.toContain('defaultValue');
  }
};

describe('interview status i18n', () => {
  it('does not hard-code fallback text for interview status labels', () => {
    expectNoDefaultValueForStatus(readFileSync(join(__dirname, '../useInterviewListCardColumns.tsx'), 'utf8'));
    expectNoDefaultValueForStatus(readFileSync(join(__dirname, '../../InterviewLiveCandidateCard/InterviewLiveCandidateCardPanel.tsx'), 'utf8'));
    expectNoDefaultValueForStatus(readFileSync(join(__dirname, '../../InterviewDetailCard/InterviewDetailHeader.tsx'), 'utf8'));
    expectNoDefaultValueForStatus(readFileSync(join(__dirname, '../../../../jobSeekerPages/MyInterviewsPage/index.tsx'), 'utf8'));
    expectNoDefaultValueForStatus(readFileSync(join(__dirname, '../../../../interviewPages/InterviewSessionPage.tsx'), 'utf8'));
  });
});
