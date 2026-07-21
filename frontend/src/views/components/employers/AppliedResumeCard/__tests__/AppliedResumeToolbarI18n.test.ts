import { readFileSync } from 'fs';
import { join } from 'path';

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

describe('AppliedResumeToolbar i18n', () => {
  it('does not hard-code fallback text for AI toolbar filters', () => {
    const source = readFileSync(join(__dirname, '../AppliedResumeToolbar.tsx'), 'utf8');
    const toolbarKeys = [
      'employer:appliedResume.ai.status.pending',
      'employer:appliedResume.ai.status.processing',
      'employer:appliedResume.ai.status.completed',
      'employer:appliedResume.ai.status.failed',
      'employer:appliedResume.ai.allStatuses',
      'employer:appliedResume.ai.scoreMin',
      'employer:appliedResume.ai.blindMode',
    ];

    for (const key of toolbarKeys) {
      const call = source.match(new RegExp(`t\\('${escapeRegex(key)}'[\\s\\S]*?\\)`))?.[0] || '';

      expect(call).toContain(`t('${key}'`);
      expect(call).not.toContain('defaultValue');
    }
  });
});
