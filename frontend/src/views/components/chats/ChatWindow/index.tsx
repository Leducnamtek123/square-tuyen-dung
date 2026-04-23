import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Box, Stack } from '@mui/material';
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
import type { Timestamp } from 'firebase/firestore';
import type { FieldValue } from 'firebase/firestore';
import db from '../../../../configs/firebase-config';
import { RootState } from '../../../../redux/store';
import { useChatContext } from '../../../../context/ChatProvider';
import commonService from '../../../../services/commonService';
import { ChatWindowComposer } from './ChatWindowComposer';
import { ChatWindowMessagePanel, type ChatWindowMessage } from './ChatWindowMessagePanel';

interface ChatRoom {
  id: string;
  members: string[];
  updatedAt: FieldValue | Timestamp;
  recipientId: string;
  createdBy: string;
  unreadCount?: number;
}

type ChatWindowState = {
  inputValue: string;
  selectedRoom: ChatRoom | null;
  partnerId: string | null;
  isLoading: boolean;
  hasMore: boolean;
  lastDocument: QueryDocumentSnapshot<DocumentData> | null;
  messages: ChatWindowMessage[];
  count: number;
  isUploading: boolean;
  uploadProgress: number;
  emojiAnchorEl: HTMLButtonElement | null;
};

type ChatWindowAction =
  | { type: 'set-input-value'; value: string }
  | { type: 'set-selected-room'; value: ChatRoom | null }
  | { type: 'set-partner-id'; value: string | null }
  | { type: 'set-loading'; value: boolean }
  | { type: 'set-has-more'; value: boolean }
  | { type: 'set-last-document'; value: QueryDocumentSnapshot<DocumentData> | null }
  | { type: 'set-messages'; value: ChatWindowMessage[] }
  | { type: 'prepend-messages'; value: ChatWindowMessage[] }
  | { type: 'set-count'; value: number }
  | { type: 'set-uploading'; value: boolean }
  | { type: 'set-upload-progress'; value: number }
  | { type: 'set-emoji-anchor'; value: HTMLButtonElement | null };

const LIMIT_MESSAGE = 20;
const messageCollectionRef = collection(db, 'messages');

const initialState: ChatWindowState = {
  inputValue: '',
  selectedRoom: null,
  partnerId: null,
  isLoading: true,
  hasMore: true,
  lastDocument: null,
  messages: [],
  count: 0,
  isUploading: false,
  uploadProgress: 0,
  emojiAnchorEl: null,
};

const reducer = (state: ChatWindowState, action: ChatWindowAction): ChatWindowState => {
  switch (action.type) {
    case 'set-input-value':
      return { ...state, inputValue: action.value };
    case 'set-selected-room':
      return { ...state, selectedRoom: action.value };
    case 'set-partner-id':
      return { ...state, partnerId: action.value };
    case 'set-loading':
      return { ...state, isLoading: action.value };
    case 'set-has-more':
      return { ...state, hasMore: action.value };
    case 'set-last-document':
      return { ...state, lastDocument: action.value };
    case 'set-messages':
      return { ...state, messages: action.value };
    case 'prepend-messages':
      return { ...state, messages: [...action.value, ...state.messages] };
    case 'set-count':
      return { ...state, count: action.value };
    case 'set-uploading':
      return { ...state, isUploading: action.value };
    case 'set-upload-progress':
      return { ...state, uploadProgress: action.value };
    case 'set-emoji-anchor':
      return { ...state, emojiAnchorEl: action.value };
    default:
      return state;
  }
};

const ChatWindow = () => {
  const { t } = useTranslation('chat');
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { currentUserChat, selectedRoomId } = useChatContext();

  const inputRef = React.useRef<HTMLInputElement>(null);
  const messageListRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const handleEmojiClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    dispatch({ type: 'set-emoji-anchor', value: event.currentTarget });
  };

  const handleEmojiClose = () => {
    dispatch({ type: 'set-emoji-anchor', value: null });
  };

  const onEmojiSelect = (emojiObject: any) => {
    dispatch({ type: 'set-input-value', value: state.inputValue + emojiObject.emoji });
  };

  React.useEffect(() => {
    if (selectedRoomId && currentUserChat) {
      const chatRoomRef = doc(db, 'chatRooms', selectedRoomId);
      updateDoc(chatRoomRef, {
        unreadCount: 0,
        recipientId: '',
      });
    }
  }, [selectedRoomId, currentUserChat]);

  React.useEffect(() => {
    if (!selectedRoomId) return;

    const chatRoomRef = doc(db, 'chatRooms', selectedRoomId);
    const unsubscribeChatRoom = onSnapshot(chatRoomRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomData = { id: snapshot.id, ...snapshot.data() } as ChatRoom;
        dispatch({ type: 'set-selected-room', value: roomData });
        if (currentUserChat) {
          const partner = roomData.members.find((member) => member !== `${currentUserChat.userId}`);
          dispatch({ type: 'set-partner-id', value: partner || null });
        }
      }
    });

    return () => unsubscribeChatRoom();
  }, [selectedRoomId, currentUserChat]);

  React.useEffect(() => {
    if (!selectedRoomId) return;

    dispatch({ type: 'set-loading', value: true });
    const q = query(
      messageCollectionRef,
      where('chatRoomId', '==', selectedRoomId),
      orderBy('createdAt', 'desc'),
      limit(LIMIT_MESSAGE),
    );

    const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
      const messagesData: ChatWindowMessage[] = [];
      querySnapshot.forEach((messageDoc) => {
        messagesData.push({ id: messageDoc.id, ...messageDoc.data() } as ChatWindowMessage);
      });
      dispatch({ type: 'set-messages', value: messagesData.reverse() });
      dispatch({
        type: 'set-last-document',
        value: querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null,
      });
      dispatch({ type: 'set-loading', value: false });
      dispatch({ type: 'set-has-more', value: querySnapshot.docs.length === LIMIT_MESSAGE });
    });

    return () => unsubscribeMessages();
  }, [selectedRoomId]);

  React.useEffect(() => {
    if (!selectedRoomId) return;

    const q = query(messageCollectionRef, where('chatRoomId', '==', selectedRoomId));
    getCountFromServer(q)
      .then((snap) => {
        dispatch({ type: 'set-count', value: snap.data().count });
      })
      .catch(() => {
        getDocs(q).then((snapshot) => dispatch({ type: 'set-count', value: snapshot.size }));
      });
  }, [selectedRoomId]);

  const sendNotificationToPartner = async (messageText: string) => {
    if (!state.partnerId || !currentUser) return;

    try {
      const notificationRef = collection(db, 'users', state.partnerId, 'notifications');
      await addDoc(notificationRef, {
        is_deleted: false,
        is_read: false,
        image: currentUser?.avatarUrl || '',
        title: 'Tin nhan moi',
        content: `${currentUser?.fullName || 'Ai do'} gui mot tin nhan.`,
        time: serverTimestamp(),
        type: 'NEW_MESSAGE',
        NEW_MESSAGE: {
          chatRoomId: selectedRoomId,
          text: messageText,
        },
      });
    } catch (err) {
      console.error('Error creating notification: ', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.inputValue.trim() || !selectedRoomId || !currentUserChat) return;

    const messageData = {
      chatRoomId: selectedRoomId,
      senderId: `${currentUserChat.userId}`,
      text: state.inputValue,
      createdAt: serverTimestamp(),
    };

    try {
      dispatch({ type: 'set-input-value', value: '' });
      await addDoc(messageCollectionRef, messageData);

      const chatRoomRef = doc(db, 'chatRooms', selectedRoomId);
      await updateDoc(chatRoomRef, {
        updatedAt: serverTimestamp(),
        lastMessage: messageData.text,
        recipientId: state.partnerId,
        unreadCount: (state.selectedRoom?.unreadCount || 0) + 1,
      });
      sendNotificationToPartner(messageData.text);
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRoomId || !currentUserChat) return;

    if (fileInputRef.current) fileInputRef.current.value = '';

    const isImage = file.type.startsWith('image/');
    const attachmentType = isImage ? 'image' : 'document';
    const fileName = file.name;

    dispatch({ type: 'set-uploading', value: true });
    dispatch({ type: 'set-upload-progress', value: 10 });

    try {
      const res = await commonService.uploadFile(file, 'OTHER');
      const downloadURL = res.url;

      dispatch({ type: 'set-uploading', value: false });
      dispatch({ type: 'set-upload-progress', value: 100 });

      const messageData = {
        chatRoomId: selectedRoomId,
        senderId: `${currentUserChat.userId}`,
        text: isImage ? 'Da gui mot hinh anh' : `Da gui file: ${fileName}`,
        createdAt: serverTimestamp(),
        attachmentUrl: downloadURL,
        attachmentType,
        fileName,
      };

      await addDoc(messageCollectionRef, messageData);

      const chatRoomRef = doc(db, 'chatRooms', selectedRoomId);
      await updateDoc(chatRoomRef, {
        updatedAt: serverTimestamp(),
        lastMessage: messageData.text,
        recipientId: state.partnerId,
        unreadCount: (state.selectedRoom?.unreadCount || 0) + 1,
      });
      sendNotificationToPartner(messageData.text);
    } catch (error) {
      console.error('Upload or save failed: ', error);
      dispatch({ type: 'set-uploading', value: false });
    }
  };

  const handleLoadMore = async () => {
    if (!state.lastDocument || !selectedRoomId) return;

    const q = query(
      messageCollectionRef,
      where('chatRoomId', '==', selectedRoomId),
      orderBy('createdAt', 'desc'),
      startAfter(state.lastDocument),
      limit(LIMIT_MESSAGE),
    );

    const querySnapshot = await getDocs(q);
    const moreMessages: ChatWindowMessage[] = [];
    querySnapshot.forEach((messageDoc) => {
      moreMessages.push({ id: messageDoc.id, ...messageDoc.data() } as ChatWindowMessage);
    });

    if (querySnapshot.docs.length > 0) {
      dispatch({
        type: 'set-last-document',
        value: querySnapshot.docs[querySnapshot.docs.length - 1],
      });
      dispatch({ type: 'prepend-messages', value: moreMessages.reverse() });
    }
    dispatch({ type: 'set-has-more', value: querySnapshot.docs.length === LIMIT_MESSAGE });
  };

  React.useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [state.messages]);

  return (
    <Stack sx={{ height: '100%', bgcolor: 'background.paper' }}>
      <ChatWindowMessagePanel
        showEmptyState={!currentUserChat || !selectedRoomId}
        isLoading={state.isLoading}
        hasMore={state.hasMore}
        messages={state.messages}
        onLoadMore={handleLoadMore}
        messageListRef={messageListRef}
        noConversationSelectedText={t('noConversationSelected')}
        chooseConversationText={t(
          'auto.index_chn_mt_cuc_hi_thoi_danh_sch_bn_5d32',
          'Chon mot cuoc hoi thoai o danh sach ben trai de bat dau nhan tin',
        )}
        loadPreviousMessagesText={t('loadPreviousMessages')}
      />

      {currentUserChat && selectedRoomId && (
        <ChatWindowComposer
          inputRef={inputRef}
          fileInputRef={fileInputRef}
          inputValue={state.inputValue}
          isUploading={state.isUploading}
          uploadProgress={state.uploadProgress}
          emojiAnchorEl={state.emojiAnchorEl}
          onSubmit={handleSendMessage}
          onFileUpload={handleFileUpload}
          onOpenFilePicker={() => fileInputRef.current?.click()}
          onEmojiClick={handleEmojiClick}
          onEmojiClose={handleEmojiClose}
          onEmojiSelect={onEmojiSelect}
          onInputChange={(value) => dispatch({ type: 'set-input-value', value })}
          placeholderText={t('typeAMessage')}
        />
      )}
    </Stack>
  );
};

export default ChatWindow;
