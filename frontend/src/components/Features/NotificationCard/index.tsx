'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Box, IconButton, Menu, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
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
import db from '@/configs/firebase-config';
import { ROUTES } from '@/configs/constants';
import { useAppSelector } from '@/hooks/useAppStore';
import NotificationCardItem, { type NotificationItem } from './NotificationCardItem';
import NotificationCardFooter from './NotificationCardFooter';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { formatRoute } from '@/utils/funcUtils';

type NotificationState = {
  count: number;
  badgeCount: number;
  notifications: NotificationItem[];
  lastKey: QueryDocumentSnapshot | null;
};

type NotificationAction =
  | { type: 'setCounts'; badgeCount: number; count: number }
  | { type: 'setList'; notifications: NotificationItem[]; lastKey: QueryDocumentSnapshot | null }
  | { type: 'append'; notifications: NotificationItem[]; lastKey: QueryDocumentSnapshot | null }
  | { type: 'remove'; key: string };

const PAGE_SIZE = 5;
const MAX_NOTIFICATIONS = 50;

const initialState: NotificationState = {
  count: 0,
  badgeCount: 0,
  notifications: [],
  lastKey: null,
};

function reducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'setCounts':
      return { ...state, badgeCount: action.badgeCount, count: action.count };
    case 'setList':
      return { ...state, notifications: action.notifications, lastKey: action.lastKey };
    case 'append':
      return {
        ...state,
        notifications: [...state.notifications, ...action.notifications].slice(0, MAX_NOTIFICATIONS),
        lastKey: action.lastKey,
      };
    case 'remove':
      return { ...state, notifications: state.notifications.filter((item) => item.key !== action.key) };
    default:
      return state;
  }
}

const NotificationCard: React.FC = () => {
  const { push } = useRouter();
  const { currentUser } = useAppSelector((state) => state.user);
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const notificationsRef = React.useMemo(() => {
    if (!currentUser?.id) return null;
    return collection(db, 'users', `${currentUser.id}`, 'notifications');
  }, [currentUser?.id]);

  const openNotificationsMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  React.useEffect(() => {
    if (!notificationsRef) return;

    let isActive = true;

    const loadCountsOnce = async () => {
      try {
        const unreadQuery = query(notificationsRef, where('is_deleted', '==', false), where('is_read', '==', false));
        const allQuery = query(notificationsRef, where('is_deleted', '==', false));
        const [unreadSnap, allSnap] = await Promise.all([getDocs(unreadQuery), getDocs(allQuery)]);
        if (!isActive) return;
        dispatch({ type: 'setCounts', badgeCount: unreadSnap.size, count: allSnap.size });
      } catch {
        if (!isActive) return;
        dispatch({ type: 'setCounts', badgeCount: 0, count: 0 });
      }
    };

    void loadCountsOnce();
    return () => {
      isActive = false;
    };
  }, [notificationsRef]);

  React.useEffect(() => {
    if (!open || !notificationsRef) return;

    const unreadQuery = query(notificationsRef, where('is_deleted', '==', false), where('is_read', '==', false));
    const allQuery = query(notificationsRef, where('is_deleted', '==', false));
    const first = query(notificationsRef, where('is_deleted', '==', false), orderBy('time', 'desc'), limit(PAGE_SIZE));

    const unsubscribeUnread = onSnapshot(unreadQuery, (querySnapshot) => {
      dispatch({ type: 'setCounts', badgeCount: querySnapshot.size, count: state.count });
    });
    const unsubscribeAll = onSnapshot(allQuery, (querySnapshot) => {
      dispatch({ type: 'setCounts', badgeCount: state.badgeCount, count: querySnapshot.size });
    });
    const unsubscribeList = onSnapshot(first, (querySnapshot) => {
      const notificationList: NotificationItem[] = querySnapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as Omit<NotificationItem, 'key'>),
        key: docSnap.id,
      }));

      dispatch({ type: 'setList', notifications: notificationList, lastKey: querySnapshot.docs[querySnapshot.docs.length - 1] || null });
    });

    return () => {
      unsubscribeUnread();
      unsubscribeAll();
      unsubscribeList();
    };
  }, [notificationsRef, open, state.badgeCount, state.count]);

  const loadMore = async () => {
    if (!currentUser || !notificationsRef || !state.lastKey) return;

    const nextQuery = query(notificationsRef, where('is_deleted', '==', false), orderBy('time', 'desc'), startAfter(state.lastKey), limit(PAGE_SIZE));
    const nextQuerySnapshot = await getDocs(nextQuery);
    const lastVisible = nextQuerySnapshot.docs[nextQuerySnapshot.docs.length - 1] || null;
    const nextNotificationList = nextQuerySnapshot.docs.map((docSnap) => ({
      ...(docSnap.data() as Omit<NotificationItem, 'key'>),
      key: docSnap.id,
    }));

    dispatch({ type: 'append', notifications: nextNotificationList, lastKey: lastVisible });
  };

  const handleRemove = (key: string) => {
    if (!currentUser) return;

    updateDoc(doc(db, 'users', `${currentUser.id}`, 'notifications', key), { is_deleted: true })
      .then(() => dispatch({ type: 'remove', key }))
      .catch(() => {
        // Notification delete error handled upstream
      });
  };

  const handleRead = (key: string) => {
    if (!currentUser) return;

    updateDoc(doc(db, 'users', `${currentUser.id}`, 'notifications', key), { is_read: true }).catch(() => {
      // Notification read error handled upstream
    });
  };

  const handleRemoveAll = async () => {
    if (!currentUser || !notificationsRef) return;

    const deleteQuery = query(notificationsRef, where('is_deleted', '==', false));
    const querySnapshot = await getDocs(deleteQuery);
    const batch = writeBatch(db);
    querySnapshot.forEach((docSnap) => {
      batch.update(docSnap.ref, { is_deleted: true });
    });
    await batch.commit();
    dispatch({ type: 'setList', notifications: [], lastKey: null });
  };

  const handleClickItem = (item: NotificationItem) => {
    switch (item.type) {
      case 'SYSTEM':
        handleRead(item.key);
        push('/');
        break;
      case 'EMPLOYER_VIEWED_RESUME':
      case 'EMPLOYER_SAVED_RESUME':
        handleRead(item.key);
        push(`/${ROUTES.JOB_SEEKER.MY_COMPANY}`);
        break;
      case 'APPLY_STATUS':
        handleRead(item.key);
        push(`/${ROUTES.JOB_SEEKER.MY_JOB}`);
        break;
      case 'COMPANY_FOLLOWED':
        handleRead(item.key);
        push(`/${ROUTES.EMPLOYER.PROFILE}`);
        break;
      case 'POST_VERIFY_RESULT':
        handleRead(item.key);
        push(`/${ROUTES.EMPLOYER.JOB_POST}`);
        break;
      case 'APPLY_JOB':
        handleRead(item.key);
        push(`/${formatRoute(ROUTES.EMPLOYER.PROFILE_DETAIL, (item.APPLY_JOB as Record<string, string>)?.resume_slug)}`);
        break;
      case 'NEW_MESSAGE':
        handleRead(item.key);
        break;
      default:
        break;
    }

    handleClose();
  };

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <IconButton size="large" aria-label="show new notifications" color="inherit" onClick={openNotificationsMenu}>
          <Badge badgeContent={state.badgeCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorEl}
        id="noti-menu"
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              borderRadius: 2,
              width: 500,
              maxHeight: 500,
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ py: 2, px: 2 }}>
          <Box sx={{ overflowY: 'auto', maxHeight: 450 }}>
            <Box sx={{ p: 1 }}>
              {state.notifications.length === 0 ? (
                <Typography textAlign="center" variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No notifications yet
                </Typography>
              ) : (
                state.notifications.map((value) => (
                  <NotificationCardItem key={value.key} value={value} onClickItem={handleClickItem} onRemove={handleRemove} />
                ))
              )}
            </Box>
          </Box>

          <NotificationCardFooter
            count={state.count}
            notificationsLength={state.notifications.length}
            onLoadMore={loadMore}
            onClearAll={handleRemoveAll}
          />
        </Box>
      </Menu>
    </React.Fragment>
  );
};

export default NotificationCard;
