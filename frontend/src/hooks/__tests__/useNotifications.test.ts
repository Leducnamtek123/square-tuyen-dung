import { notificationsReducer, type AppNotification } from '../notificationsState';

const notification = (
  key: string,
  isRead: boolean
): AppNotification => ({
  key,
  title: key,
  is_read: isRead,
  is_deleted: false,
});

describe('useNotifications state', () => {
  it('keeps counts in sync when removing an unread notification', () => {
    const state = {
      count: 2,
      unreadCount: 1,
      isLoading: false,
      notifications: [
        notification('unread', false),
        notification('read', true),
      ],
      lastKey: null,
    };

    expect(
      notificationsReducer(state, { type: 'notificationRemoved', key: 'unread' })
    ).toMatchObject({
      count: 1,
      unreadCount: 0,
      notifications: [notification('read', true)],
    });
  });

  it('keeps unread count unchanged when removing a read notification', () => {
    const state = {
      count: 2,
      unreadCount: 1,
      isLoading: false,
      notifications: [
        notification('unread', false),
        notification('read', true),
      ],
      lastKey: null,
    };

    expect(
      notificationsReducer(state, { type: 'notificationRemoved', key: 'read' })
    ).toMatchObject({
      count: 1,
      unreadCount: 1,
      notifications: [notification('unread', false)],
    });
  });

  it('can restore counts when a removed unread notification is rolled back', () => {
    const state = {
      count: 1,
      unreadCount: 0,
      isLoading: false,
      notifications: [notification('read', true)],
      lastKey: null,
    };

    expect(
      notificationsReducer(state, {
        type: 'notificationRestored',
        notification: notification('unread', false),
        index: 0,
      })
    ).toMatchObject({
      count: 2,
      unreadCount: 1,
      notifications: [
        notification('unread', false),
        notification('read', true),
      ],
    });
  });

  it('can roll a read notification back to unread without duplicating unread count', () => {
    const state = {
      count: 1,
      unreadCount: 0,
      isLoading: false,
      notifications: [notification('unread', true)],
      lastKey: null,
    };

    expect(
      notificationsReducer(state, { type: 'notificationReadFailed', key: 'unread' })
    ).toMatchObject({
      unreadCount: 1,
      notifications: [notification('unread', false)],
    });

    expect(
      notificationsReducer(
        {
          ...state,
          unreadCount: 1,
          notifications: [notification('unread', false)],
        },
        { type: 'notificationReadFailed', key: 'unread' }
      )
    ).toMatchObject({
      unreadCount: 1,
      notifications: [notification('unread', false)],
    });
  });
});
