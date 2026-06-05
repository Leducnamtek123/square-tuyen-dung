import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

const fptGpuKeys = [
  'pages.settings.fptGpu.title',
  'pages.settings.fptGpu.controlEnabled',
  'pages.settings.fptGpu.readOnly',
  'pages.settings.fptGpu.notConfigured',
  'pages.settings.fptGpu.tenant',
  'pages.settings.fptGpu.runningCost',
  'pages.settings.fptGpu.stoppedDiskCost',
  'pages.settings.fptGpu.start',
  'pages.settings.fptGpu.stop',
  'pages.settings.fptGpu.refresh',
  'pages.settings.fptGpu.openConsole',
  'pages.settings.fptGpu.toast.startSuccess',
  'pages.settings.fptGpu.toast.stopSuccess',
  'pages.settings.fptGpu.toast.actionError',
];

describe('SettingsPage i18n', () => {
  it('does not hard-code FPT GPU card copy in source', () => {
    [
      'FPT GPU Container',
      'Control enabled',
      'Read only',
      'Add FPT_GPU_BSS_ACCESS_TOKEN or FPT_GPU_ACCESS_TOKEN on the backend to enable Start and Stop.',
      'Tenant',
      'Running cost',
      'Stopped disk cost',
      'Open FPT',
      'FPT GPU start requested.',
      'FPT GPU stop requested.',
      'FPT GPU action failed.',
    ].forEach((text) => {
      expect(source).not.toContain(text);
    });

    [
      />\s*Start\s*</,
      />\s*Stop\s*</,
      />\s*Refresh\s*</,
    ].forEach((pattern) => {
      expect(source).not.toMatch(pattern);
    });
  });

  it('uses admin locale keys for FPT GPU copy', () => {
    fptGpuKeys.forEach((key) => {
      expect(source).toContain(`'${key}'`);
    });
  });

  it('formats FPT GPU VND costs with the active language', () => {
    expect(source).not.toContain("new Intl.NumberFormat('vi-VN')");
    expect(source).toContain('formatVndPerHour');
    expect(source).toContain('i18n.language');
  });

  it('has Vietnamese and English locale entries for FPT GPU copy', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/admin.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/admin.json'), 'utf8'));

    fptGpuKeys.forEach((key) => {
      const path = key.replace('pages.', '').split('.');
      const readKey = (locale: Record<string, unknown>) => path.reduce<unknown>(
        (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
        locale.pages
      );

      expect(readKey(vi)).toEqual(expect.any(String));
      expect(readKey(en)).toEqual(expect.any(String));
    });
  });
});
