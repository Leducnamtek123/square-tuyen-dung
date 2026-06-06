import React from 'react';
import { useSelector } from 'react-redux';
import { ChatContext } from '../../../../context/ChatProvider';
import { addDocument, checkChatRoomExists, checkExists, createUser } from '../../../../services/firebaseService';
import { RootState } from '../../../../redux/store';
import { normalizePaginatedResponse } from '../../../../utils/apiResponse';
import type { ChatAccountData, ChatRoomDocument } from '../../../../services/firebaseService';

export type UserDataPayload = ChatAccountData;

type RightSidebarState<T> = {
  isLoading: boolean;
  dataList: T[];
  count: number;
};

type RightSidebarAction<T> =
  | { type: 'loading' }
  | { type: 'loaded'; count: number; results: T[] }
  | { type: 'finished' };

export type RightSidebarFetchResponse<T> =
  | T[]
  | {
      count?: number;
      results?: T[];
      data?: T[] | { count?: number; results?: T[]; data?: { count?: number; results?: T[] } };
    }
  | null
  | undefined;

export const normalizeRightSidebarResponse = <T,>(response: RightSidebarFetchResponse<T>): { count: number; results: T[] } => {
  return normalizePaginatedResponse<T>(response);
};

const createInitialState = <T,>(): RightSidebarState<T> => ({
  isLoading: true,
  dataList: [],
  count: 0,
});

const rightSidebarReducer = <T,>(
  state: RightSidebarState<T>,
  action: RightSidebarAction<T>
): RightSidebarState<T> => {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true };
    case 'loaded':
      return { isLoading: false, dataList: action.results, count: action.count };
    case 'finished':
      return { ...state, isLoading: false };
    default:
      return state;
  }
};

export const useRightSidebarData = <T,>(fetchData: (params: { page: number; pageSize: number }) => Promise<RightSidebarFetchResponse<T>>, pageSize: number = 12) => {
  const context = React.use(ChatContext);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const userId = currentUser?.id;

  const [state, dispatch] = React.useReducer(rightSidebarReducer<T>, undefined, createInitialState<T>);
  const [page, setPage] = React.useState(1);

  const { setSelectedRoomId } = context || {};

  React.useEffect(() => {
    const loadData = async () => {
      dispatch({ type: 'loading' });
      try {
        const resData = await fetchData({ page, pageSize });
        const data = normalizeRightSidebarResponse<T>(resData);
        dispatch({
          type: 'loaded',
          count: data.count,
          results: data.results,
        });
      } catch (error) {
        // Error handled silently
        dispatch({ type: 'finished' });
      }
    };
    loadData();
  }, [page, fetchData, pageSize]);

  const handleAddRoom = async (partnerId: string, userData: UserDataPayload) => {
    const normalizedPartnerId = String(partnerId || '').trim();
    if (!userId || !setSelectedRoomId || !normalizedPartnerId) return;

    let allowCreateNewChatRoom = false;
    const isExists = await checkExists('accounts', normalizedPartnerId);
    if (!isExists) {
      const createResult = await createUser('accounts', userData, normalizedPartnerId);
      if (createResult) {
        allowCreateNewChatRoom = true;
      }
    } else {
      allowCreateNewChatRoom = true;
    }

    if (allowCreateNewChatRoom) {
      let chatRoomId = await checkChatRoomExists('chatRooms', userId, normalizedPartnerId);
      if (chatRoomId === null) {
        const newRoom: ChatRoomDocument = {
          members: [`${userId}`, normalizedPartnerId],
          membersString: [`${userId}-${normalizedPartnerId}`, `${normalizedPartnerId}-${userId}`],
          recipientId: normalizedPartnerId,
          createdBy: `${userId}`,
          unreadCount: 0
        };
        chatRoomId = await addDocument('chatRooms', newRoom);
      }
      setSelectedRoomId(chatRoomId);
    }
  };

  return {
    isLoading: state.isLoading,
    dataList: state.dataList,
    page,
    setPage,
    count: state.count,
    handleAddRoom,
    pageSize,
    isContextReady: !!context && !!setSelectedRoomId
  };
};
