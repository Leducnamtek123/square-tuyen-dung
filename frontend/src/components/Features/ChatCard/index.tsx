import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';
import { Badge, IconButton } from "@mui/material";
import ForumIcon from '@mui/icons-material/Forum';
import {
  collection,
  onSnapshot,
  query,
  where,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import db from '@/configs/firebase-config';
import { ROUTES } from '@/configs/constants';

interface ChatCardProps {
  // Add specific props if needed
}

const chatRoomCollectionRef = collection(db, 'chatRooms');

const ChatCard = (_props: ChatCardProps) => {
  const { currentUser, activeWorkspace } = useAppSelector((state) => state.user);
  const nav = useRouter();
  const [count, setCount] = React.useState(0);

  const isEmployer = React.useMemo(() => {
    return activeWorkspace?.type === "company";
  }, [activeWorkspace]);

  React.useEffect(() => {
    if (!currentUser?.id) return;

    const q = query(
      chatRoomCollectionRef,
      where('recipientId', '==', `${currentUser.id}`),
      where('unreadCount', '>', 0)
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      let total = 0;
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const documentData = doc.data();
        const unreadCount = documentData.unreadCount || 0;
        total += unreadCount;
      });
      setCount(total);
      // total unread messages loaded
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const handleRedirect = () => {
    if (isEmployer) {
      nav.push(`/${ROUTES.EMPLOYER.CHAT}`);
    } else {
      nav.push(`/${ROUTES.JOB_SEEKER.CHAT}`);
    }
  };

  return (
    <IconButton
      onClick={handleRedirect}
      size="large"
      aria-label="show new notifications"
      color="inherit"
    >
      <Badge badgeContent={count} color="error">
        <ForumIcon />
      </Badge>
    </IconButton>
  );
};

export default ChatCard;
