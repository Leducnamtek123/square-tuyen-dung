import React from 'react';
import { collection, onSnapshot, query, where, orderBy, startAfter, limit, getDocs } from 'firebase/firestore';
import db from '../../../../configs/firebase-config';
import { useChatContext } from '../../../../context/ChatProvider';
import { getUserAccount } from '../../../../services/firebaseService';
import type { Timestamp } from 'firebase/firestore';
import type { DocumentSnapshot } from 'firebase/firestore';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
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

const resolveChatRoomData = async (
  docSnap: QueryDocumentSnapshot,
  currentUserId: string
): Promise<ChatRoomData | null> => {
  try {
    const chatRoomData = docSnap.data();
    const partnerId = chatRoomData?.members[0] === currentUserId
      ? chatRoomData?.members[1]
      : chatRoomData?.members[0];
    const userAccount = await getUserAccount('accounts', `${partnerId}`) as UserAccount | null;
    return {
      ...(chatRoomData as Omit<ChatRoomData, "id" | "user">),
      id: docSnap.id,
      user: userAccount || undefined,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

const noopUnsubscribe = () => {};

const subscribeToChatRoomCount = (
  currentUserId: string | undefined,
  onCountChanged: (count: number) => void,
) => {
  if (!currentUserId) return noopUnsubscribe;

  const q = query(
    chatRoomCollectionRef,
    where('members', 'array-contains', currentUserId)
  );

  return onSnapshot(q, (querySnapshot) => {
    onCountChanged(querySnapshot?.size || 0);
  });
};

const subscribeToInitialChatRooms = (
  currentUserId: string | undefined,
  onLoading: () => void,
  onLoaded: (chatRooms: ChatRoomData[], lastDocument: DocumentSnapshot | null) => void,
) => {
  if (!currentUserId) return noopUnsubscribe;

  onLoading();
  const q = query(
    chatRoomCollectionRef,
    where('members', 'array-contains', currentUserId),
    orderBy('updatedAt', 'desc'),
    limit(LIMIT)
  );

  return onSnapshot(q, async (querySnapshot) => {
    const lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
    const chatRoomsData = (await Promise.all(
      querySnapshot.docs.map((docSnap) => resolveChatRoomData(docSnap, currentUserId))
    )).filter((chatRoom): chatRoom is ChatRoomData => !!chatRoom);
    onLoaded(chatRoomsData, lastDocument);
  });
};

type ChatRoomsState = {
  isLoading: boolean;
  hasMore: boolean;
  lastDocument: DocumentSnapshot | null;
  chatRooms: ChatRoomData[];
  page: number;
  count: number;
};

type ChatRoomsAction =
  | { type: 'countChanged'; count: number }
  | { type: 'loading' }
  | { type: 'initialLoaded'; chatRooms: ChatRoomData[]; lastDocument: DocumentSnapshot | null }
  | { type: 'loadedMore'; chatRooms: ChatRoomData[]; lastDocument: DocumentSnapshot | null }
  | { type: 'noMore' };

const initialChatRoomsState: ChatRoomsState = {
  isLoading: true,
  hasMore: true,
  lastDocument: null,
  chatRooms: [],
  page: 0,
  count: 0,
};

const chatRoomsReducer = (state: ChatRoomsState, action: ChatRoomsAction): ChatRoomsState => {
  switch (action.type) {
    case 'countChanged':
      return { ...state, count: action.count };
    case 'loading':
      return { ...state, isLoading: true };
    case 'initialLoaded':
      return {
        ...state,
        isLoading: false,
        hasMore: true,
        page: 1,
        chatRooms: action.chatRooms,
        lastDocument: action.lastDocument,
      };
    case 'loadedMore':
      return {
        ...state,
        page: state.page + 1,
        chatRooms: [...state.chatRooms, ...action.chatRooms],
        lastDocument: action.lastDocument,
      };
    case 'noMore':
      return { ...state, hasMore: false };
    default:
      return state;
  }
};

export const useChatRooms = () => {
  const { currentUserChat, setSelectedRoomId } = useChatContext();
  const [state, dispatch] = React.useReducer(chatRoomsReducer, initialChatRoomsState);
  const currentUserId = currentUserChat?.userId ? `${currentUserChat.userId}` : undefined;

  React.useEffect(() => {
    return subscribeToChatRoomCount(currentUserId, (count) => {
      dispatch({ type: 'countChanged', count });
    });
  }, [currentUserId]);

  React.useEffect(() => {
    return subscribeToInitialChatRooms(
      currentUserId,
      () => dispatch({ type: 'loading' }),
      (chatRooms, lastDocument) => {
        dispatch({ type: 'initialLoaded', chatRooms, lastDocument });
      },
    );
  }, [currentUserId]);

  const handleLoadMore = () => {
    const getMoreData = async () => {
      if (state.lastDocument !== null && currentUserId) {
        const q = query(
          chatRoomCollectionRef,
          where('members', 'array-contains', currentUserId),
          orderBy('updatedAt', 'desc'),
          startAfter(state.lastDocument),
          limit(LIMIT)
        );
        const querySnapshot = await getDocs(q);
        const lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1] || state.lastDocument;
        const chatRoomsData = (await Promise.all(
          querySnapshot.docs.map((docSnap) => resolveChatRoomData(docSnap, currentUserId))
        )).filter((chatRoom): chatRoom is ChatRoomData => !!chatRoom);
        dispatch({ type: 'loadedMore', chatRooms: chatRoomsData, lastDocument });
      }
    };
    if (Math.ceil(state.count / LIMIT) > state.page) {
      getMoreData();
    } else {
      dispatch({ type: 'noMore' });
    }
  };

  const handleSelectRoom = (chatRoom: ChatRoomData) => {
    setSelectedRoomId(chatRoom?.id);
  };

  return {
    isLoading: state.isLoading,
    hasMore: state.hasMore,
    chatRooms: state.chatRooms,
    handleLoadMore,
    handleSelectRoom,
    currentUserChat
  };
};
