import { readFileSync } from 'fs';
import { join } from 'path';

const expectNotificationKeyHasNoFallback = (source: string, key: string) => {
  const call = source.match(new RegExp(`t\\('${key.replaceAll('.', '\\.')}'[\\s\\S]*?\\)`))?.[0] || '';

  expect(call).toContain(`t('${key}'`);
  expect(call).not.toContain('defaultValue');
};

describe('NotificationCard i18n', () => {
  it('does not hard-code fallback text in notification menu copy', () => {
    const menuSource = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
    const itemSource = readFileSync(join(__dirname, '../NotificationCardItem.tsx'), 'utf8');
    const footerSource = readFileSync(join(__dirname, '../NotificationCardFooter.tsx'), 'utf8');

    expectNotificationKeyHasNoFallback(menuSource, 'notification.openMenu');
    expectNotificationKeyHasNoFallback(menuSource, 'notification.unreadCount');
    expectNotificationKeyHasNoFallback(itemSource, 'notification.read');
    expectNotificationKeyHasNoFallback(itemSource, 'notification.new');
    expectNotificationKeyHasNoFallback(footerSource, 'notification.loadMore');
    expectNotificationKeyHasNoFallback(footerSource, 'notification.viewAll');

    expect(itemSource).not.toContain('aria-label="delete"');
    expect(itemSource).toContain("t('actions.delete')");
  });
});
