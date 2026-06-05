import { readFileSync } from 'fs';
import { join } from 'path';

describe('InterviewCreateCardQuestionSection i18n', () => {
  it('does not hard-code an English fallback for schedule time validation', () => {
    const source = readFileSync(join(__dirname, '../InterviewCreateCardQuestionSection.tsx'), 'utf8');

    expect(source).toContain("rules={{ required: t('interview:interviewCreateCard.validation.selectScheduleTime') }}");
    expect(source).not.toContain('Please select interview time');
  });
});
