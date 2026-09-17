import { readFileSync } from 'fs';
import { join } from 'path';
import {
  DEFAULT_EMPLOYER_AI_SETTINGS,
  PRESET_BACKGROUNDS,
  PRESET_AVATARS,
} from '@/services/employerAiSettingService';

describe('EmployerAiSettingsCard and AI Settings Suite', () => {
  it('contains valid preset configurations', () => {
    expect(PRESET_BACKGROUNDS.length).toBeGreaterThanOrEqual(4);
    expect(PRESET_AVATARS.length).toBeGreaterThanOrEqual(2);
    expect(DEFAULT_EMPLOYER_AI_SETTINGS.interviewerName).toBe('Trợ lý AI AILA');
  });

  it('ensures EmployerAiSettingsCard source code complies with UI standards and contains no parentheses in Vietnamese prose', () => {
    const cardPath = join(__dirname, '../index.tsx');
    const source = readFileSync(cardPath, 'utf8');

    // Verify key UI features
    expect(source).toContain('InterviewAvatar');
    expect(source).toContain('employerAiSettingService');
    expect(source).toContain('commonService.uploadFile');
    expect(source).toContain('isSpeakingTest');
    expect(source).toContain('toastMessages.success');

    // Verify buttons do not use gradient
    expect(source).not.toContain('linear-gradient');
    expect(source).not.toContain('bg-gradient');

    // Extract all string literals (single, double, template)
    const stringLiterals = source.match(/(["'`])(?:(?=(\\?))\2[\s\S])*?\1/g) || [];
    const vietnameseCharRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

    const vietnameseStringsWithParentheses = stringLiterals.filter(
      (str) => vietnameseCharRegex.test(str) && /[()]/.test(str)
    );
    expect(vietnameseStringsWithParentheses).toEqual([]);

    // Extract all comments
    const commentLines = source.split('\n').filter((line) => line.trim().startsWith('//') || line.trim().startsWith('{/*'));
    const vietnameseCommentsWithParentheses = commentLines.filter(
      (comment) => vietnameseCharRegex.test(comment) && /[()]/.test(comment)
    );
    expect(vietnameseCommentsWithParentheses).toEqual([]);
  });
});
