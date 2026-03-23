import React from 'react';
import { useSelector } from 'react-redux';
import {
  checkExists,
  createUser,
  getUserAccount,
} from '../services/firebaseService';
import type { RootState } from '../redux/store';
import type { User } from '../types/models';

interface ChatProviderProps {
  children: React.ReactNode;
}

interface ChatUser {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  company?: any;
}

interface ChatContextValue {
  currentUserChat: ChatUser | null;
  selectedRoomId: string;
  setSelectedRoomId: (id: string) => void;
}

export const ChatContext = React.createContext<ChatContextValue | undefined>(undefined);

const ChatProvider = ({ children }: ChatProviderProps) => {
  const { currentUser, activeWorkspace } = useSelector((state: RootState) => state.user);

  const userId = currentUser?.id;

  const [selectedRoomId, setSelectedRoomId] = React.useState('');
  const [currentUserChat, setCurrentUserChat] = React.useState<ChatUser | null>(null);

  React.useEffect(() => {
    if (!currentUser || !userId) return;

    const createUserChat = async () => {
      const isExists = await checkExists('accounts', userId);

      if (!isExists) {
        // tao moi user tren firestore.
        let userData = null;

        if (activeWorkspace?.type !== "company") {
          userData = {
            userId: userId,
            name: currentUser?.fullName,
            email: currentUser?.email,
            avatarUrl: currentUser?.avatarUrl,
            company: null,
          };
        } else {
          // Narrowing type for company access if needed, 
          // but currentUser type in models.ts has optional company related fields or we can cast
          const userWithCompany = currentUser as User & { company?: { imageUrl?: string; id?: number; slug?: string; companyName?: string } };
          
          userData = {
            userId: userId,
            name: currentUser?.fullName,
            email: currentUser?.email,
            avatarUrl: userWithCompany.company?.imageUrl || currentUser?.avatarUrl,
            company: {
              companyId: userWithCompany.company?.id,
              slug: userWithCompany.company?.slug,
              companyName: userWithCompany.company?.companyName,
              imageUrl: userWithCompany.company?.imageUrl,
            },
          };
        }

        const createResult = await createUser('accounts', userData, userId);
        // User created on Firestore
      }

      // lay thong tin user hien tai
      const userChat = await getUserAccount('accounts', userId) as unknown as ChatUser;
      setCurrentUserChat(userChat);
      // userChat initialized
    };

    createUserChat();
  }, [activeWorkspace, currentUser, userId]);

  return (
    <ChatContext.Provider
      value={{
        currentUserChat,
        selectedRoomId,
        setSelectedRoomId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
