import { readFileSync } from 'fs';
import { join } from 'path';

const expectNoDefaultValue = (source: string, key: string) => {
  const call = source.match(new RegExp(`t(?:Ref\\.current)?\\('${key.replaceAll('.', '\\.')}'[\\s\\S]*?\\)`))?.[0] || '';

  expect(call).toContain(`('${key}'`);
  expect(call).not.toContain('defaultValue');
};

describe('InterviewSessionPage i18n', () => {
  it('does not hard-code fallback text for fixed live interview messages', () => {
    const source = readFileSync(join(__dirname, '../InterviewSessionPage.tsx'), 'utf8');

    expectNoDefaultValue(source, 'errors.endSessionFailed');
    expectNoDefaultValue(source, 'interview:interviewDetail.messages.interruptedResumeHint');
  });
});
