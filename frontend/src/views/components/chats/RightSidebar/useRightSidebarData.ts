import React from 'react';
import { useSelector } from 'react-redux';
import { ChatContext } from '../../../../context/ChatProvider';
import { addDocument, checkChatRoomExists, checkExists, createUser } from '../../../../services/firebaseService';
import { RootState } from '../../../../redux/store';

export interface UserDataPayload {
  userId?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  company?: {
    companyId?: string;
    slug?: string;
    companyName?: string;
    imageUrl?: string;
  } | null;
  [key: string]: unknown;
}

export const useRightSidebarData = <T,>(fetchData: (params: { page: number; pageSize: number }) => Promise<{ count: number; results: T[] }>, pageSize: number = 12) => {
  const context = React.useContext(ChatContext);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const userId = currentUser?.id;

  const [isLoading, setIsLoading] = React.useState(true);
  const [dataList, setDataList] = React.useState<T[]>([]);
  const [page, setPage] = React.useState(1);
  const [count, setCount] = React.useState(0);

  const { setSelectedRoomId } = context || {};

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const resData = await fetchData({ page, pageSize });
        const data = resData;
        setCount(data.count);
        setDataList(data.results);
      } catch (error) {
        // Error handled silently
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [page, fetchData, pageSize]);

  const handleAddRoom = async (partnerId: string, userData: UserDataPayload) => {
    if (!userId || !setSelectedRoomId) return;

    let allowCreateNewChatRoom = false;
    const isExists = await checkExists('accounts', partnerId);
    if (!isExists) {
      const createResult = await createUser('accounts', userData, partnerId);
      if (createResult) {
        allowCreateNewChatRoom = true;
      }
    } else {
      allowCreateNewChatRoom = true;
    }

    if (allowCreateNewChatRoom) {
      let chatRoomId = await checkChatRoomExists('chatRooms', userId, partnerId);
      if (chatRoomId === null) {
        chatRoomId = await addDocument('chatRooms', {
          members: [`${userId}`, `${partnerId}`],
          membersString: [`${userId}-${partnerId}`, `${partnerId}-${userId}`],
          recipientId: `${partnerId}`,
          createdBy: `${userId}`,
          unreadCount: 0
        });
      }
      setSelectedRoomId(chatRoomId);
    }
  };

  return {
    isLoading,
    dataList,
    page,
    setPage,
    count,
    handleAddRoom,
    pageSize,
    isContextReady: !!context && !!setSelectedRoomId
  };
};
