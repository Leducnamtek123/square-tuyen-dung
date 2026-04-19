import React from 'react';
import { useSelector } from 'react-redux';
import {
  checkExists,
  createUser,
  getUserAccount,
} from '../services/firebaseService';
import type { ChatAccountData } from '../services/firebaseService';
import type { RootState } from '../redux/store';
import type { User } from '../types/models';

interface ChatProviderProps {
  children: React.ReactNode;
}

export interface ChatUser {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  company?: ChatCompany | null;
}

export interface ChatCompany {
  companyId?: number;
  slug?: string;
  companyName?: string;
  imageUrl?: string;
}

export interface ChatContextValue {
  currentUserChat: ChatUser | null;
  selectedRoomId: string;
  setSelectedRoomId: (id: string) => void;
}

export const ChatContext = React.createContext<ChatContextValue | undefined>(undefined);

/** Type-safe hook to consume ChatContext */
export const useChatContext = (): ChatContextValue => {
  const ctx = React.useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return ctx;
};

/** Extends User with optional company data that the backend may return */
interface UserWithCompany extends User {
  company?: {
    id?: number;
    slug?: string;
    companyName?: string;
    imageUrl?: string;
  };
}

const ChatProvider = ({ children }: ChatProviderProps) => {
  const { currentUser, activeWorkspace } = useSelector((state: RootState) => state.user);

  const userId = currentUser?.id;

  const [selectedRoomId, setSelectedRoomId] = React.useState('');
  const [currentUserChat, setCurrentUserChat] = React.useState<ChatUser | null>(null);

  React.useEffect(() => {
    if (!currentUser || !userId) return;

    let cancelled = false;

    const createUserChat = async () => {
      try {
        const isExists = await checkExists('accounts', userId);

        if (!isExists) {
          let userData: ChatAccountData;

          if (activeWorkspace?.type !== 'company') {
            userData = {
              userId,
              name: currentUser.fullName ?? '',
              email: currentUser.email,
              avatarUrl: currentUser.avatarUrl ?? null,
              company: null,
            };
          } else {
            const userWithCompany = currentUser as UserWithCompany;
            userData = {
              userId,
              name: currentUser.fullName ?? '',
              email: currentUser.email,
              avatarUrl: (userWithCompany.company?.imageUrl || currentUser.avatarUrl) ?? null,
              company: {
                companyId: userWithCompany.company?.id,
                slug: userWithCompany.company?.slug,
                companyName: userWithCompany.company?.companyName,
                imageUrl: userWithCompany.company?.imageUrl,
              },
            };
          }

          await createUser('accounts', userData, userId);
        }

        const userChat = (await getUserAccount('accounts', userId)) as ChatUser | null;
        if (!cancelled) {
          setCurrentUserChat(userChat || null);
        }
      } catch {
        // Silently fail for chat initialization
      }
    };

    createUserChat();

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace, currentUser, userId]);

  const contextValue = React.useMemo<ChatContextValue>(
    () => ({
      currentUserChat,
      selectedRoomId,
      setSelectedRoomId,
    }),
    [currentUserChat, selectedRoomId]
  );

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
