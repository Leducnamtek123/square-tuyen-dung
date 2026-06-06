import { readFileSync } from 'fs';
import { join } from 'path';

describe('default NotificationCard i18n', () => {
  it('does not hard-code fallback text for notification labels', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
    const notificationKeys = [
      'notification.unreadCount',
      'notification.new',
      'notification.loadMore',
    ];

    for (const key of notificationKeys) {
      const call = source.match(new RegExp(`t\\('${key.replaceAll('.', '\\.')}'[\\s\\S]*?\\)`))?.[0] || '';

      expect(call).toContain(`t('${key}'`);
      expect(call).not.toContain('defaultValue');
    }

    expect(source).not.toContain('aria-label="delete"');
    expect(source).toContain("t('actions.delete')");
  });
});
