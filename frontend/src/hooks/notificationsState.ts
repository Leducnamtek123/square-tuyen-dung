import type { DocumentSnapshot } from 'firebase/firestore';

export interface AppNotification {
  key: string;
  title?: string;
  content?: string;
  imageUrl?: string | null;
  image?: string | null;
  type?: string;
  is_read?: boolean;
  is_deleted?: boolean;
  time?: { seconds: number; nanoseconds?: number } | null;
  link?: string;
  url?: string;
  APPLY_JOB?: { resume_id?: string | number; resume_slug?: string };
  NEW_MESSAGE?: { chatRoomId?: string; text?: string };
  POST_VERIFY_REQUIRED?: { job_post_id?: string | number };
  [key: string]: unknown;
}

export type NotificationsState = {
  count: number;
  unreadCount: number;
  isLoading: boolean;
  notifications: AppNotification[];
  lastKey: DocumentSnapshot | null;
};

export type NotificationsAction =
  | { type: 'loading' }
  | { type: 'reset' }
  | { type: 'countLoaded'; count: number }
  | { type: 'unreadCountLoaded'; count: number }
  | { type: 'initialLoaded'; notifications: AppNotification[]; lastKey: DocumentSnapshot | null }
  | { type: 'loadMoreLoaded'; notifications: AppNotification[]; lastKey: DocumentSnapshot | null; maxNotifications: number }
  | { type: 'notificationRead'; key: string }
  | { type: 'notificationReadFailed'; key: string }
  | { type: 'notificationRemoved'; key: string }
  | { type: 'notificationRestored'; notification: AppNotification; index: number }
  | { type: 'allRead' }
  | { type: 'allRemoved' }
  | { type: 'finishedLoading' };

export const initialNotificationsState: NotificationsState = {
  count: 0,
  unreadCount: 0,
  isLoading: false,
  notifications: [],
  lastKey: null,
};

export const notificationsReducer = (
  state: NotificationsState,
  action: NotificationsAction
): NotificationsState => {
  switch (action.type) {
    case 'loading':
      return {
        ...state,
        isLoading: true,
      };
    case 'reset':
      return initialNotificationsState;
    case 'countLoaded':
      return {
        ...state,
        count: action.count,
      };
    case 'unreadCountLoaded':
      return {
        ...state,
        unreadCount: action.count,
      };
    case 'initialLoaded':
      return {
        ...state,
        isLoading: false,
        notifications: action.notifications,
        lastKey: action.lastKey,
      };
    case 'loadMoreLoaded': {
      const existingKeys = new Set(state.notifications.map((notification) => notification.key));
      const combined = [
        ...state.notifications,
        ...action.notifications.filter((notification) => !existingKeys.has(notification.key)),
      ];

      return {
        ...state,
        isLoading: false,
        notifications: combined.slice(0, action.maxNotifications),
        lastKey: action.lastKey,
      };
    }
    case 'notificationRead':
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.key === action.key ? { ...notification, is_read: true } : notification
        ),
        unreadCount: Math.max(
          0,
          state.unreadCount -
          (state.notifications.find((notification) => notification.key === action.key)?.is_read === false ? 1 : 0)
        ),
      };
    case 'notificationReadFailed': {
      const readNotification = state.notifications.find((notification) => notification.key === action.key);
      if (!readNotification || readNotification.is_read === false) {
        return state;
      }

      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.key === action.key ? { ...notification, is_read: false } : notification
        ),
        unreadCount: state.unreadCount + 1,
      };
    }
    case 'notificationRemoved': {
      const removedNotification = state.notifications.find((notification) => notification.key === action.key);
      if (!removedNotification) {
        return state;
      }

      return {
        ...state,
        notifications: state.notifications.filter((notification) => notification.key !== action.key),
        count: Math.max(0, state.count - 1),
        unreadCount: Math.max(
          0,
          state.unreadCount - (removedNotification.is_read === false ? 1 : 0)
        ),
      };
    }
    case 'notificationRestored': {
      if (state.notifications.some((notification) => notification.key === action.notification.key)) {
        return state;
      }

      const insertionIndex = Math.min(
        Math.max(action.index, 0),
        state.notifications.length
      );
      const notifications = [...state.notifications];
      notifications.splice(insertionIndex, 0, action.notification);

      return {
        ...state,
        notifications,
        count: state.count + 1,
        unreadCount: state.unreadCount + (action.notification.is_read === false ? 1 : 0),
      };
    }
    case 'allRead':
      return {
        ...state,
        unreadCount: 0,
        notifications: state.notifications.map((notification) => ({ ...notification, is_read: true })),
      };
    case 'allRemoved':
      return {
        ...state,
        notifications: [],
        count: 0,
        unreadCount: 0,
        lastKey: null,
      };
    case 'finishedLoading':
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};
