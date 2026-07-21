import { readFileSync } from 'fs';
import { join } from 'path';

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getTranslationCall = (source: string, key: string) => (
  source.match(new RegExp(`t\\('${escapeRegex(key)}'[\\s\\S]*?\\)`))?.[0] || ''
);

const expectNoFallback = (source: string, key: string) => {
  const call = getTranslationCall(source, key);

  expect(call).toContain(`t('${key}'`);
  expect(call).not.toContain('defaultValue');
  expect(call).not.toMatch(new RegExp(`t\\('${escapeRegex(key)}'\\s*,\\s*['"]`));
};

describe('applied resume list i18n', () => {
  it('does not hard-code fallback text in applied resume table actions', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

    expectNoFallback(source, 'appliedResume.table.clickToDownload');
    expectNoFallback(source, 'employees.hrm.convert.openEmployee');
  });

  it('does not hard-code fallback text in applied resume email actions', () => {
    const source = readFileSync(join(__dirname, '../SendEmailComponent.tsx'), 'utf8');

    expectNoFallback(source, 'appliedResume.email.resendTooltip');
    expectNoFallback(source, 'appliedResume.email.sendTooltip');
  });

  it('does not hard-code fallback text in applied resume kanban actions and resume type labels', () => {
    const source = readFileSync(join(__dirname, '../../AppliedResumeKanban/index.tsx'), 'utf8');

    expectNoFallback(source, 'appliedResume.table.tooltips.scheduleInterview');
    expectNoFallback(source, 'employees.hrm.convert.openEmployee');
    expectNoFallback(source, 'appliedResume.table.onlineResume');
    expectNoFallback(source, 'appliedResume.table.attachedResume');
    expect(source).not.toContain("isOnlineResume ? 'Online' : 'File'");
  });
});
