import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import Message from '../Message';

export type ChatWindowMessage = {
  id: string;
  text: string;
  senderId: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
  attachmentUrl?: string;
  attachmentType?: string;
  fileName?: string;
};

type ChatWindowMessagePanelProps = {
  showEmptyState: boolean;
  isLoading: boolean;
  hasMore: boolean;
  messages: ChatWindowMessage[];
  onLoadMore: () => void;
  messageListRef: React.RefObject<HTMLDivElement | null>;
  noConversationSelectedText: string;
  chooseConversationText: string;
  loadPreviousMessagesText: string;
};

export const ChatWindowMessagePanel = ({
  showEmptyState,
  isLoading,
  hasMore,
  messages,
  onLoadMore,
  messageListRef,
  noConversationSelectedText,
  chooseConversationText,
  loadPreviousMessagesText,
}: ChatWindowMessagePanelProps) => {
  if (showEmptyState) {
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
          {noConversationSelectedText}
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
          {chooseConversationText}
        </Typography>
      </Box>
    );
  }

  return (
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
                onClick={onLoadMore}
              >
                {loadPreviousMessagesText}
              </Typography>
            </Box>
          )}
          {messages.map((msg) => (
            <Message
              key={msg.id}
              userId={msg.senderId}
              text={msg.text}
              createdAt={msg.createdAt}
              attachmentUrl={msg.attachmentUrl}
              attachmentType={msg.attachmentType}
              fileName={msg.fileName}
            />
          ))}
        </>
      )}
    </Box>
  );
};
