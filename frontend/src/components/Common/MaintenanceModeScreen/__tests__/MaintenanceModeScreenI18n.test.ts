import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

const maintenanceKeys = [
  'maintenanceMode.badge',
  'maintenanceMode.title',
  'maintenanceMode.message',
  'maintenanceMode.reload',
  'maintenanceMode.retryHint',
  'maintenanceMode.statusCode',
];

describe('MaintenanceModeScreen i18n', () => {
  it('does not hide missing maintenance mode keys with hard-coded fallback copy', () => {
    [
      'Đang bảo trì',
      'Hệ thống đang bảo trì',
      'Square Tuyển Dụng đang nâng cấp',
      'Tải lại trang',
      'Bạn có thể thử lại sau ít phút.',
      'Mã trạng thái',
    ].forEach((copy) => {
      expect(source).not.toContain(copy);
    });

    maintenanceKeys.forEach((key) => {
      const usage = ['t', '(', "'", key, "'", ')'].join('');
      expect(source).toContain(usage);
    });
  });

  it('has Vietnamese and English locale entries for maintenance mode copy', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/common.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/common.json'), 'utf8'));

    maintenanceKeys.forEach((key) => {
      const readKey = (locale: Record<string, unknown>) => key.split('.').reduce<unknown>(
        (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
        locale
      );

      expect(readKey(vi)).toEqual(expect.any(String));
      expect(readKey(en)).toEqual(expect.any(String));
    });
  });
});
