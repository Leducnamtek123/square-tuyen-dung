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
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import db from '../configs/firebase-config';
import { useAppSelector } from './useAppStore';

const PAGE_SIZE = 10;
const MAX_NOTIFICATIONS = 50;

interface AppNotification {
  key: string;
  title?: string;
  content?: string;
  imageUrl?: string | null;
  image?: string | null;
  type?: string;
  is_read?: boolean;
  is_deleted?: boolean;
  time?: { seconds: number; nanoseconds?: number };
  link?: string;
  APPLY_JOB?: { resume_slug?: string };
}

interface UseNotificationsReturn {
  count: number;
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
  isLoading: boolean;
  notifications: AppNotification[];
  lastKey: DocumentSnapshot | null;
};

type NotificationsAction =
  | { type: 'loading' }
  | { type: 'countLoaded'; count: number }
  | { type: 'initialLoaded'; notifications: AppNotification[]; lastKey: DocumentSnapshot | null }
  | { type: 'loadMoreLoaded'; notifications: AppNotification[]; lastKey: DocumentSnapshot | null }
  | { type: 'notificationRemoved'; key: string }
  | { type: 'allRemoved' }
  | { type: 'finishedLoading' };

const initialNotificationsState: NotificationsState = {
  count: 0,
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
    case 'countLoaded':
      return {
        ...state,
        count: action.count,
      };
    case 'initialLoaded':
      return {
        ...state,
        isLoading: false,
        notifications: action.notifications,
        lastKey: action.lastKey,
      };
    case 'loadMoreLoaded': {
      const combined = [...state.notifications, ...action.notifications];

      return {
        ...state,
        notifications: combined.slice(0, MAX_NOTIFICATIONS),
        lastKey: action.lastKey,
      };
    }
    case 'notificationRemoved':
      return {
        ...state,
        notifications: state.notifications.filter((notification) => notification.key !== action.key),
        count: Math.max(0, state.count - 1),
      };
    case 'allRemoved':
      return {
        ...state,
        notifications: [],
        count: 0,
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

export const useNotifications = (): UseNotificationsReturn => {
  const { currentUser } = useAppSelector((state) => state.user);
  const [state, dispatch] = React.useReducer(notificationsReducer, initialNotificationsState);

  const getCollectionRef = React.useCallback(() => {
    if (!currentUser?.id) return null;
    return collection(db, 'users', `${currentUser.id}`, 'notifications');
  }, [currentUser]);

  React.useEffect(() => {
    const notificationsRef = getCollectionRef();
    if (!notificationsRef) return;

    dispatch({ type: 'loading' });

    const allQuery = query(notificationsRef, where('is_deleted', '==', false));
    getDocs(allQuery)
      .then((snap) => dispatch({ type: 'countLoaded', count: snap.size }))
      .catch(() => {});

    const first = query(
      notificationsRef,
      where('is_deleted', '==', false),
      orderBy('time', 'desc'),
      limit(PAGE_SIZE)
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
  }, [getCollectionRef]);

  const loadMore = async () => {
    const notificationsRef = getCollectionRef();
    if (!notificationsRef || !state.lastKey) return;

    const nextQuery = query(
      notificationsRef,
      where('is_deleted', '==', false),
      orderBy('time', 'desc'),
      startAfter(state.lastKey),
      limit(PAGE_SIZE)
    );

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
    });
  };

  const handleRead = async (key: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'users', `${currentUser.id}`, 'notifications', key), {
        is_read: true,
      });
    } catch {
      // Ignored
    }
  };

  const handleRemove = async (key: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'users', `${currentUser.id}`, 'notifications', key), {
        is_deleted: true,
      });
      dispatch({ type: 'notificationRemoved', key });
    } catch {
      // Ignored
    }
  };

  const handleMakeAllRead = async () => {
    const notificationsRef = getCollectionRef();
    if (!notificationsRef) return;

    const readQuery = query(notificationsRef, where('is_read', '==', false));
    const querySnapshot = await getDocs(readQuery);

    const batch = writeBatch(db);
    querySnapshot.forEach((docSnap) => {
      batch.update(docSnap.ref, { is_read: true });
    });
    await batch.commit();
  };

  const handleRemoveAll = async () => {
    const notificationsRef = getCollectionRef();
    if (!notificationsRef) return;

    const deleteQuery = query(notificationsRef, where('is_deleted', '==', false));
    const querySnapshot = await getDocs(deleteQuery);

    const batch = writeBatch(db);
    querySnapshot.forEach((docSnap) => {
      batch.update(docSnap.ref, { is_deleted: true });
    });
    await batch.commit();
    dispatch({ type: 'allRemoved' });
  };

  return {
    count: state.count,
    isLoading: state.isLoading,
    notifications: state.notifications,
    loadMore,
    hasMore:
      Math.ceil(state.count / PAGE_SIZE) > 1 &&
      state.notifications.length < state.count &&
      state.notifications.length < MAX_NOTIFICATIONS,
    handleRead,
    handleRemove,
    handleMakeAllRead,
    handleRemoveAll,
  };
};
