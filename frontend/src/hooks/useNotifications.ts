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
} from 'firebase/firestore';
import db from '../configs/firebase-config';
import { useAppSelector } from './useAppStore';

const PAGE_SIZE = 10;
const MAX_NOTIFICATIONS = 50;

export const useNotifications = () => {
  const { currentUser } = useAppSelector((state) => state.user);
  const [count, setCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [lastKey, setLastKey] = React.useState<any>(null);

  const getCollectionRef = React.useCallback(() => {
    if (!currentUser?.id) return null;
    return collection(db, 'users', `${currentUser.id}`, 'notifications');
  }, [currentUser]);

  React.useEffect(() => {
    const notificationsRef = getCollectionRef();
    if (!notificationsRef) return;

    setIsLoading(true);

    // Initial count
    const allQuery = query(notificationsRef, where('is_deleted', '==', false));
    getDocs(allQuery)
      .then((snap) => setCount(snap.size))
      .catch(() => {});

    // Initial list limit
    const first = query(
      notificationsRef,
      where('is_deleted', '==', false),
      orderBy('time', 'desc'),
      limit(PAGE_SIZE)
    );

    const unsubscribe = onSnapshot(first, (querySnapshot) => {
      const notificationList: any[] = [];
      querySnapshot.forEach((docSnap) => {
        notificationList.push({
          ...docSnap.data(),
          key: docSnap.id,
        });
      });
      setNotifications(notificationList);
      setLastKey(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
      setIsLoading(false);
    }, (error) => {
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [getCollectionRef]);

  const loadMore = async () => {
    const notificationsRef = getCollectionRef();
    if (!notificationsRef || !lastKey) return;

    const nextQuery = query(
      notificationsRef,
      where('is_deleted', '==', false),
      orderBy('time', 'desc'),
      startAfter(lastKey),
      limit(PAGE_SIZE)
    );

    const nextQuerySnapshot = await getDocs(nextQuery);
    const lastVisible = nextQuerySnapshot.docs[nextQuerySnapshot.docs.length - 1];

    const nextNotificationList: any[] = [];
    nextQuerySnapshot.forEach((docSnap) => {
      nextNotificationList.push({
        ...docSnap.data(),
        key: docSnap.id,
      });
    });

    const combined = [...notifications, ...nextNotificationList];
    setNotifications(combined.slice(0, MAX_NOTIFICATIONS));
    setLastKey(lastVisible);
  };

  const handleRead = async (key: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'users', `${currentUser.id}`, 'notifications', key), {
        is_read: true,
      });
    } catch (error) {
      // Ignored
    }
  };

  const handleRemove = async (key: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'users', `${currentUser.id}`, 'notifications', key), {
        is_deleted: true,
      });
      setNotifications((prev) => prev.filter((val) => val.key !== key));
    } catch (error) {
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
    setNotifications([]);
  };

  return {
    count,
    isLoading,
    notifications,
    loadMore,
    hasMore: Math.ceil(count / PAGE_SIZE) > 1 && notifications.length < count && notifications.length < MAX_NOTIFICATIONS,
    handleRead,
    handleRemove,
    handleMakeAllRead,
    handleRemoveAll
  };
};
