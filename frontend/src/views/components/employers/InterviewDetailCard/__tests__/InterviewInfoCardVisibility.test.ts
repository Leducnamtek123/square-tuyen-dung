import { readFileSync } from 'fs';
import { join } from 'path';

describe('InterviewInfoCard visibility', () => {
  const source = readFileSync(join(__dirname, '../InterviewInfoCard.tsx'), 'utf8');

  it('does not render the interview type row in the employer detail summary', () => {
    expect(source).not.toContain("t('interviewDetail.label.type')");
    expect(source).not.toContain('CategoryIcon');
    expect(source).not.toContain('session.interview_type');
  });
});
