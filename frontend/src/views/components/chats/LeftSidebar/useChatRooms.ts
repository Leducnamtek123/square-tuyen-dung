import React from 'react';
import { collection, onSnapshot, query, where, orderBy, startAfter, limit, getDocs } from 'firebase/firestore';
import db from '../../../../configs/firebase-config';
import { useChatContext } from '../../../../context/ChatProvider';
import { getUserAccount } from '../../../../services/firebaseService';
import type { Timestamp } from 'firebase/firestore';
import type { DocumentSnapshot } from 'firebase/firestore';
import type { FieldValue } from 'firebase/firestore';

export interface UserAccount {
  id?: string;
  userId?: string;
  name?: string;
  avatarUrl?: string;
  email?: string;
  company?: {
    companyName?: string;
  };
}

export interface ChatRoomData {
  id: string;
  members: string[];
  updatedAt: FieldValue | Timestamp;
  user?: UserAccount;
  recipientId?: string;
  unreadCount?: number;
}

const LIMIT = 20;
const chatRoomCollectionRef = collection(db, 'chatRooms');

export const useChatRooms = () => {
  const { currentUserChat, setSelectedRoomId } = useChatContext();
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasMore, setHasMore] = React.useState(true);
  const [lastDocument, setLastDocument] = React.useState<DocumentSnapshot | null>(null);
  const [chatRooms, setChatRooms] = React.useState<ChatRoomData[]>([]);
  const [page, setPage] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (currentUserChat) {
      const q = query(
        chatRoomCollectionRef,
        where('members', 'array-contains', `${currentUserChat.userId}`)
      );
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        setCount(querySnapshot?.size || 0);
      });
      return () => unsubscribe();
    }
  }, [currentUserChat]);

  React.useEffect(() => {
    if (currentUserChat) {
      setIsLoading(true);
      let q = query(
        chatRoomCollectionRef,
        where('members', 'array-contains', `${currentUserChat.userId}`),
        orderBy('updatedAt', 'desc'),
        limit(LIMIT)
      );
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        let chatRoomsData: ChatRoomData[] = [];
        const promises = querySnapshot.docs.map(async (doc) => {
          try {
            let partnerId = '';
            const chatRoomData = doc.data();
            if (chatRoomData?.members[0] === `${currentUserChat.userId}`) {
              partnerId = chatRoomData?.members[1];
            } else {
              partnerId = chatRoomData?.members[0];
            }
            const userAccount = await getUserAccount('accounts', `${partnerId}`) as UserAccount | null;
            chatRoomsData.push({
              ...(chatRoomData as Omit<ChatRoomData, "id" | "user">),
              id: doc.id,
              user: userAccount || undefined,
            });
          } catch (error) {
            console.error(error);
          }
        });
        if (querySnapshot.docs.length > 0) {
          setLastDocument(querySnapshot.docs[querySnapshot.docs.length - 1]);
        }
        await Promise.all(promises);
        setChatRooms(chatRoomsData);
        setHasMore(true);
        setPage(1);
        setIsLoading(false);
      });
      return () => unsubscribe();
    }
  }, [currentUserChat]);

  const handleLoadMore = () => {
    const getMoreData = async () => {
      if (lastDocument !== null && currentUserChat) {
        const q = query(
          chatRoomCollectionRef,
          where('members', 'array-contains', `${currentUserChat.userId}`),
          orderBy('updatedAt', 'desc'),
          startAfter(lastDocument),
          limit(LIMIT)
        );
        const querySnapshot = await getDocs(q);
        let chatRoomsData: ChatRoomData[] = [];
        if (querySnapshot.docs.length > 0) {
          setLastDocument(querySnapshot.docs[querySnapshot.docs.length - 1]);
        }
        const promises = querySnapshot.docs.map(async (doc) => {
          try {
            let partnerId = '';
            const chatRoomData = doc.data();
            if (chatRoomData?.members[0] === `${currentUserChat.userId}`) {
              partnerId = chatRoomData?.members[1];
            } else {
              partnerId = chatRoomData?.members[0];
            }
            const userAccount = await getUserAccount('accounts', `${partnerId}`) as UserAccount | null;
            chatRoomsData.push({
              ...(chatRoomData as Omit<ChatRoomData, "id" | "user">),
              id: doc.id,
              user: userAccount || undefined,
            });
          } catch (error) {
            console.error(error);
          }
        });
        await Promise.all(promises);
        setChatRooms(prev => [...prev, ...chatRoomsData]);
      }
    };
    if (Math.ceil(count / LIMIT) > page) {
      setPage(page + 1);
      getMoreData();
    } else {
      setHasMore(false);
    }
  };

  const handleSelectRoom = (chatRoom: ChatRoomData) => {
    setSelectedRoomId(chatRoom?.id);
  };

  return {
    isLoading,
    hasMore,
    chatRooms,
    handleLoadMore,
    handleSelectRoom,
    currentUserChat
  };
};
