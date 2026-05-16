import React from 'react';
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  query,
  where,
  startAfter,
  orderBy,
  updateDoc,
  doc,
  writeBatch,
  type CollectionReference,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import db from '../configs/firebase-config';
import { useAppSelector } from './useAppStore';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_MAX_NOTIFICATIONS = 50;
const FIRESTORE_BATCH_LIMIT = 450;

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

interface UseNotificationsOptions {
  pageSize?: number;
  maxNotifications?: number;
  listEnabled?: boolean;
}

interface UseNotificationsReturn {
  count: number;
  unreadCount: number;
  isLoading: boolean;
  notifications: AppNotification[];
  loadMore: () => Promise<void>;
  hasMore: boolean;
  handleRead: (key: string) => Promise<void>;
  handleRemove: (key: string) => Promise<void>;
  handleMakeAllRead: () => Promise<void>;
  handleRemoveAll: () => Promise<void>;
}

type NotificationsState = {
  count: number;
  unreadCount: number;
  isLoading: boolean;
  notifications: AppNotification[];
  lastKey: DocumentSnapshot | null;
};

type NotificationsAction =
  | { type: 'loading' }
  | { type: 'reset' }
  | { type: 'countLoaded'; count: number }
  | { type: 'unreadCountLoaded'; count: number }
  | { type: 'initialLoaded'; notifications: AppNotification[]; lastKey: DocumentSnapshot | null }
  | { type: 'loadMoreLoaded'; notifications: AppNotification[]; lastKey: DocumentSnapshot | null; maxNotifications: number }
  | { type: 'notificationRead'; key: string }
  | { type: 'notificationRemoved'; key: string }
  | { type: 'allRead' }
  | { type: 'allRemoved' }
  | { type: 'finishedLoading' };

const initialNotificationsState: NotificationsState = {
  count: 0,
  unreadCount: 0,
  isLoading: false,
  notifications: [],
  lastKey: null,
};

const notificationsReducer = (
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
    case 'notificationRemoved':
      return {
        ...state,
        notifications: state.notifications.filter((notification) => notification.key !== action.key),
      };
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

const commitUpdatesInChunks = async (
  docs: QueryDocumentSnapshot<DocumentData>[],
  value: Record<string, unknown>
) => {
  for (let index = 0; index < docs.length; index += FIRESTORE_BATCH_LIMIT) {
    const batch = writeBatch(db);
    docs.slice(index, index + FIRESTORE_BATCH_LIMIT).forEach((docSnap) => {
      batch.update(docSnap.ref, value);
    });
    await batch.commit();
  }
};

export const useNotifications = ({
  pageSize = DEFAULT_PAGE_SIZE,
  maxNotifications = DEFAULT_MAX_NOTIFICATIONS,
  listEnabled = true,
}: UseNotificationsOptions = {}): UseNotificationsReturn => {
  const { currentUser } = useAppSelector((state) => state.user);
  const [state, dispatch] = React.useReducer(notificationsReducer, initialNotificationsState);
  const userId = currentUser?.id ? `${currentUser.id}` : null;

  const notificationsRef = React.useMemo<CollectionReference<DocumentData> | null>(() => {
    if (!userId) return null;
    return collection(db, 'users', userId, 'notifications');
  }, [userId]);

  React.useEffect(() => {
    if (!notificationsRef) {
      dispatch({ type: 'reset' });
      return;
    }

    const activeQuery = query(notificationsRef, where('is_deleted', '==', false));
    const unreadQuery = query(
      notificationsRef,
      where('is_deleted', '==', false),
      where('is_read', '==', false)
    );

    const unsubscribeActive = onSnapshot(
      activeQuery,
      (querySnapshot) => {
        dispatch({ type: 'countLoaded', count: querySnapshot.size });
      },
      () => {
        dispatch({ type: 'countLoaded', count: 0 });
      }
    );

    const unsubscribeUnread = onSnapshot(
      unreadQuery,
      (querySnapshot) => {
        dispatch({ type: 'unreadCountLoaded', count: querySnapshot.size });
      },
      () => {
        dispatch({ type: 'unreadCountLoaded', count: 0 });
      }
    );

    return () => {
      unsubscribeActive();
      unsubscribeUnread();
    };
  }, [notificationsRef]);

  React.useEffect(() => {
    if (!notificationsRef) {
      dispatch({ type: 'reset' });
      return;
    }

    if (!listEnabled) {
      dispatch({ type: 'initialLoaded', notifications: [], lastKey: null });
      return;
    }

    dispatch({ type: 'loading' });

    const first = query(
      notificationsRef,
      where('is_deleted', '==', false),
      orderBy('time', 'desc'),
      limit(pageSize)
    );

    const unsubscribe = onSnapshot(first, (querySnapshot) => {
      const notificationList: AppNotification[] = [];

      querySnapshot.forEach((docSnap: QueryDocumentSnapshot) => {
        notificationList.push({
          ...(docSnap.data() as Omit<AppNotification, 'key'>),
          key: docSnap.id,
        });
      });

      dispatch({
        type: 'initialLoaded',
        notifications: notificationList,
        lastKey: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
      });
    }, () => {
      dispatch({ type: 'finishedLoading' });
    });

    return () => unsubscribe();
  }, [listEnabled, notificationsRef, pageSize]);

  const loadMore = async () => {
    if (!notificationsRef || !state.lastKey || !listEnabled) return;

    const nextQuery = query(
      notificationsRef,
      where('is_deleted', '==', false),
      orderBy('time', 'desc'),
      startAfter(state.lastKey),
      limit(pageSize)
    );

    dispatch({ type: 'loading' });
    try {
      const nextQuerySnapshot = await getDocs(nextQuery);
      const lastVisible = nextQuerySnapshot.docs[nextQuerySnapshot.docs.length - 1];

      const nextNotificationList: AppNotification[] = [];
      nextQuerySnapshot.forEach((docSnap: QueryDocumentSnapshot) => {
        nextNotificationList.push({
          ...(docSnap.data() as Omit<AppNotification, 'key'>),
          key: docSnap.id,
        });
      });

      dispatch({
        type: 'loadMoreLoaded',
        notifications: nextNotificationList,
        lastKey: lastVisible || null,
        maxNotifications,
      });
    } catch {
      dispatch({ type: 'finishedLoading' });
    }
  };

  const handleRead = async (key: string) => {
    if (!userId) return;
    try {
      await updateDoc(doc(db, 'users', userId, 'notifications', key), {
        is_read: true,
      });
      dispatch({ type: 'notificationRead', key });
    } catch {
      // Ignored
    }
  };

  const handleRemove = async (key: string) => {
    if (!userId) return;
    try {
      await updateDoc(doc(db, 'users', userId, 'notifications', key), {
        is_deleted: true,
      });
      dispatch({ type: 'notificationRemoved', key });
    } catch {
      // Ignored
    }
  };

  const handleMakeAllRead = async () => {
    if (!notificationsRef) return;

    const readQuery = query(
      notificationsRef,
      where('is_deleted', '==', false),
      where('is_read', '==', false)
    );
    const querySnapshot = await getDocs(readQuery);

    await commitUpdatesInChunks(querySnapshot.docs, { is_read: true });
    dispatch({ type: 'allRead' });
  };

  const handleRemoveAll = async () => {
    if (!notificationsRef) return;

    const deleteQuery = query(notificationsRef, where('is_deleted', '==', false));
    const querySnapshot = await getDocs(deleteQuery);

    await commitUpdatesInChunks(querySnapshot.docs, { is_deleted: true });
    dispatch({ type: 'allRemoved' });
  };

  return {
    count: state.count,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    notifications: state.notifications,
    loadMore,
    hasMore:
      Math.ceil(state.count / pageSize) > 1 &&
      state.notifications.length < state.count &&
      state.notifications.length < maxNotifications,
    handleRead,
    handleRemove,
    handleMakeAllRead,
    handleRemoveAll,
  };
};
