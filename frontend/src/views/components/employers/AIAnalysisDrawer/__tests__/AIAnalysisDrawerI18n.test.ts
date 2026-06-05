import { readFileSync } from 'fs';
import { join } from 'path';

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const expectNoDefaultValue = (source: string, key: string) => {
  const call = source.match(new RegExp(`t\\('${escapeRegex(key)}'[\\s\\S]*?\\)`))?.[0] || '';

  expect(call).toContain(`t('${key}'`);
  expect(call).not.toContain('defaultValue');
};

describe('AIAnalysisDrawer i18n', () => {
  it('does not hard-code fallback text for online resume copy', () => {
    const source = readFileSync(join(__dirname, '../AIAnalysisDrawerResumeSection.tsx'), 'utf8');

    expectNoDefaultValue(source, 'appliedResume.ai.onlineResumeLabel');
    expectNoDefaultValue(source, 'appliedResume.ai.onlineResumeHint');
    expectNoDefaultValue(source, 'appliedResume.ai.viewOnlineProfile');
  });

  it('does not hard-code fallback text for AI review actions and section titles', () => {
    const drawerSource = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
    const panelsSource = readFileSync(join(__dirname, '../AIAnalysisDrawerStatePanels.tsx'), 'utf8');

    expectNoDefaultValue(drawerSource, 'appliedResume.ai.reviewSaved');
    expectNoDefaultValue(panelsSource, 'employer:appliedResume.ai.reviewTitle');
    expectNoDefaultValue(panelsSource, 'employer:appliedResume.ai.overrideScore');
    expectNoDefaultValue(panelsSource, 'employer:appliedResume.ai.reviewNote');
    expectNoDefaultValue(panelsSource, 'employer:appliedResume.ai.saveReview');
    expectNoDefaultValue(panelsSource, 'employer:appliedResume.ai.criteriaTitle');
    expectNoDefaultValue(panelsSource, 'employer:appliedResume.ai.evidenceTitle');
  });
});
