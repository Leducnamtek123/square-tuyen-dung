import { readFileSync } from 'fs';
import { join } from 'path';

describe('AppliedResumeFilterForm i18n', () => {
  it('does not hard-code fallback text for AI filter labels', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
    const aiFilterKeys = [
      'ai.reviewStatus.aiOnly',
      'ai.reviewStatus.reviewed',
      'ai.reviewStatus.overridden',
      'ai.reviewStatus.label',
      'ai.reviewStatus.all',
      'ai.scoreMax',
    ];

    for (const key of aiFilterKeys) {
      const call = source.match(new RegExp(`t\\('${key.replaceAll('.', '\\.')}'[\\s\\S]*?\\)`))?.[0] || '';

      expect(call).toContain(`t('${key}'`);
      expect(call).not.toContain('defaultValue');
    }
  });
});
