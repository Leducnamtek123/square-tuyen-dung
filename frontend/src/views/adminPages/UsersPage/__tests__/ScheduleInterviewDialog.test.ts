import { readFileSync } from 'fs';
import { join } from 'path';
import { normalizeScheduleQuestionOptions } from '../components/ScheduleInterviewDialog';

const source = readFileSync(join(__dirname, '../components/ScheduleInterviewDialog.tsx'), 'utf8');

const fixedKeys = [
  'pages.users.scheduleInterviewDialog.success',
  'pages.users.scheduleInterviewDialog.error',
  'pages.users.scheduleInterviewDialog.schedulingBtn',
];
const questionFallbackKey = 'pages.users.scheduleInterviewDialog.questionFallback';

describe('ScheduleInterviewDialog', () => {
  it('normalizes schedule question option response shapes', () => {
    const question = { id: 1, text: 'React fundamentals' };

    expect(normalizeScheduleQuestionOptions([question])).toEqual([question]);
    expect(normalizeScheduleQuestionOptions({ results: [question] })).toEqual([question]);
    expect(normalizeScheduleQuestionOptions({ data: [question] })).toEqual([question]);
    expect(normalizeScheduleQuestionOptions({ data: { results: [question] } })).toEqual([question]);
    expect(normalizeScheduleQuestionOptions({ data: { data: { count: 1, results: [question] } } })).toEqual([question]);
    expect(normalizeScheduleQuestionOptions(null)).toEqual([]);
  });

  it('submits to the interview API instead of showing a placeholder toast', () => {
    expect(source).not.toContain('Under construction');
    expect(source).toContain('interviewService.scheduleSession');
  });

  it('uses the snake_case interview session serializer payload', () => {
    ['candidate', 'scheduled_at', 'question_ids', 'type'].forEach((field) => {
      expect(source).toContain(`${field}:`);
    });

    ['candidate_name', 'candidate_email', 'interview_type'].forEach((field) => {
      expect(source).not.toContain(`${field}:`);
    });
  });

  it('uses admin locale keys for schedule result copy', () => {
    fixedKeys.forEach((key) => {
      expect(source).toContain(`'${key}'`);
    });
  });

  it('uses localized no-options copy for the question selector', () => {
    expect(source).toContain("noOptionsText={t('common:noOptions')}");
    expect(source).not.toContain('No options');
  });

  it('uses localized fallback labels for questions without content', () => {
    expect(source).toContain(`t('${questionFallbackKey}'`);
    expect(source).not.toContain('Question #');
  });

  it('has Vietnamese and English locale entries for schedule result copy', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/admin.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/admin.json'), 'utf8'));

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

  it('has Vietnamese and English common no-options locale entries', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/common.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/common.json'), 'utf8'));

    expect(vi.noOptions).toEqual(expect.any(String));
    expect(en.noOptions).toEqual(expect.any(String));
  });

  it('has Vietnamese and English locale entries for question fallback labels', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/admin.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/admin.json'), 'utf8'));
    const path = questionFallbackKey.replace('pages.', '').split('.');
    const readKey = (locale: Record<string, unknown>) => path.reduce<unknown>(
      (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
      locale.pages
    );

    expect(readKey(vi)).toEqual(expect.any(String));
    expect(readKey(en)).toEqual(expect.any(String));
  });
});
