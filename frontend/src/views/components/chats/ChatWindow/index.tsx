import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box,
  CircularProgress,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Typography,
  Avatar,
  Divider,
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDocs,
  startAfter,
  getCountFromServer,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import db from '../../../../configs/firebase-config';
import Message from '../Message';
import { RootState } from '../../../../redux/store';
import { useChatContext } from '../../../../context/ChatProvider';

// Types
interface ChatRoom {
  id: string;
  members: string[];
  updatedAt: import('firebase/firestore').FieldValue | import('firebase/firestore').Timestamp;
  recipientId: string;
  createdBy: string;
  unreadCount?: number;
}

interface MessageData {
  id: string;
  text: string;
  senderId: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
}

const LIMIT_MESSAGE = 20;
const messageCollectionRef = collection(db, 'messages');

const ChatWindow = () => {
  const { t } = useTranslation('chat');
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { currentUserChat, selectedRoomId, setSelectedRoomId } = useChatContext();

  const inputRef = React.useRef<HTMLInputElement>(null);
  const messageListRef = React.useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = React.useState('');
  const [selectedRoom, setSelectedRoom] = React.useState<ChatRoom | null>(null);
  const [partnerId, setPartnerId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasMore, setHasMore] = React.useState(true);
  const [lastDocument, setLastDocument] = React.useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [messages, setMessages] = React.useState<MessageData[]>([]);
  const [count, setCount] = React.useState(0);

  // Update unreadCount
  React.useEffect(() => {
    if (selectedRoomId && currentUserChat) {
      const chatRoomRef = doc(db, 'chatRooms', selectedRoomId);
      updateDoc(chatRoomRef, {
        unreadCount: 0,
        recipientId: '',
      });
    }
  }, [selectedRoomId, currentUserChat]);

  // Load chat room details
  React.useEffect(() => {
    if (selectedRoomId) {
      const chatRoomRef = doc(db, 'chatRooms', selectedRoomId);
      const unsubscribeChatRoom = onSnapshot(chatRoomRef, (doc) => {
        if (doc.exists()) {
          const roomData = { id: doc.id, ...doc.data() } as ChatRoom;
          setSelectedRoom(roomData);
          if (currentUserChat) {
            const partner = roomData.members.find(
              (member) => member !== `${currentUserChat.userId}`
            );
            setPartnerId(partner || null);
          }
        }
      });
      return () => unsubscribeChatRoom();
    }
  }, [selectedRoomId, currentUserChat]);

  // Listen to messages (real-time)
  React.useEffect(() => {
    if (selectedRoomId) {
      setIsLoading(true);
      const q = query(
        messageCollectionRef,
        where('chatRoomId', '==', selectedRoomId),
        orderBy('createdAt', 'desc'),
        limit(LIMIT_MESSAGE)
      );

      const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
        const messagesData: MessageData[] = [];
        querySnapshot.forEach((doc) => {
          messagesData.push({ id: doc.id, ...doc.data() } as MessageData);
        });
        setMessages(messagesData.reverse());
        if (querySnapshot.docs.length > 0) {
          setLastDocument(querySnapshot.docs[querySnapshot.docs.length - 1]);
        }
        setIsLoading(false);
        setHasMore(querySnapshot.docs.length === LIMIT_MESSAGE);
      });

      return () => unsubscribeMessages();
    }
  }, [selectedRoomId]);

  // Load total message count (without downloading all docs)
  React.useEffect(() => {
    if (selectedRoomId) {
      const q = query(
        messageCollectionRef,
        where('chatRoomId', '==', selectedRoomId)
      );
      getCountFromServer(q).then((snap) => {
        setCount(snap.data().count);
      }).catch(() => {
        // Fallback: use getDocs if getCountFromServer not available
        getDocs(q).then((s) => setCount(s.size));
      });
    }
  }, [selectedRoomId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedRoomId || !currentUserChat) return;

    const messageData = {
      chatRoomId: selectedRoomId,
      senderId: `${currentUserChat.userId}`,
      text: inputValue,
      createdAt: serverTimestamp(),
    };

    try {
      setInputValue('');
      await addDoc(messageCollectionRef, messageData);
      
      const chatRoomRef = doc(db, 'chatRooms', selectedRoomId);
      await updateDoc(chatRoomRef, {
        updatedAt: serverTimestamp(),
        lastMessage: inputValue,
        recipientId: partnerId,
        unreadCount: (selectedRoom?.unreadCount || 0) + 1,
      });
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  const handleLoadMore = async () => {
    if (!lastDocument || !selectedRoomId) return;

    const q = query(
      messageCollectionRef,
      where('chatRoomId', '==', selectedRoomId),
      orderBy('createdAt', 'desc'),
      startAfter(lastDocument),
      limit(LIMIT_MESSAGE)
    );

    const querySnapshot = await getDocs(q);
    const moreMessages: MessageData[] = [];
    querySnapshot.forEach((doc) => {
      moreMessages.push({ id: doc.id, ...doc.data() } as MessageData);
    });

    if (querySnapshot.docs.length > 0) {
      setLastDocument(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setMessages((prev) => [...moreMessages.reverse(), ...prev]);
    }
    setHasMore(querySnapshot.docs.length === LIMIT_MESSAGE);
  };

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  if (!currentUserChat || !selectedRoomId) {
    return (
      <Box 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'background.default',
          borderLeft: 1,
          borderRight: 1,
          borderColor: 'divider',
        }}
      >
        <ChatBubbleOutlineIcon sx={{ fontSize: 64, mb: 2, color: 'text.disabled' }} />
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
          {t('noConversationSelected')}
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
          Chọn một cuộc hội thoại ở danh sách bên trái để bắt đầu nhắn tin
        </Typography>
      </Box>
    );
  }

  return (
    <Stack sx={{ height: '100%', bgcolor: 'background.paper' }}>
      {/* Messages list */}
      <Box
        ref={messageListRef}
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '10px',
          },
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            {hasMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                <Typography 
                  variant="caption" 
                  sx={{ cursor: 'pointer', color: 'primary.main' }}
                  onClick={handleLoadMore}
                >
                  {t('loadPreviousMessages')}
                </Typography>
              </Box>
            )}
            {messages.map((msg) => (
              <Message
                key={msg.id}
                userId={msg.senderId}
                text={msg.text}
                createdAt={msg.createdAt}
              />
            ))}
          </>
        )}
      </Box>

      {/* Input area */}
      <Paper
        component="form"
        onSubmit={handleSendMessage}
        elevation={0}
        sx={{
          p: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <IconButton size="small" sx={{ mr: 1 }}>
          <AttachFileIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" sx={{ mr: 1 }}>
          <SentimentSatisfiedAltIcon fontSize="small" />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1, fontSize: 14 }}
          placeholder={t('typeAMessage')}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          inputRef={inputRef}
        />
        <IconButton 
          type="submit" 
          disabled={!inputValue.trim()}
          sx={{ 
            ml: 1,
            bgcolor: inputValue.trim() ? 'primary.main' : 'action.hover',
            color: inputValue.trim() ? 'white' : 'action.disabled',
            '&:hover': {
              bgcolor: inputValue.trim() ? 'primary.dark' : 'action.hover'
            },
            transition: 'all 0.2s',
            width: 40,
            height: 40,
          }}
        >
          <SendIcon fontSize="small" sx={{ transform: 'translateX(2px)' }} />
        </IconButton>
      </Paper>
    </Stack>
  );
};

export default ChatWindow;
