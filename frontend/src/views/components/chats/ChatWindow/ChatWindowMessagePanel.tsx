import React from 'react';
import { Box, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import Message from '../Message';
import { formatDateDivider } from '../../../../utils/dateHelper';

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
  partnerAvatarUrl?: string;
  myAvatarUrl?: string;
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
  partnerAvatarUrl,
  myAvatarUrl,
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
          bgcolor: '#f8fafc',
          p: 3,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'rgba(37, 99, 235, 0.08)',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2.5,
            boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.15)',
          }}
        >
          <ForumRoundedIcon sx={{ fontSize: 40 }} />
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '-0.01em',
            mb: 0.75,
          }}
        >
          {noConversationSelectedText}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            maxWidth: 380,
            lineHeight: 1.6,
          }}
        >
          {chooseConversationText}
        </Typography>
      </Box>
    );
  }

  let lastDateDivider = '';

  return (
    <Box
      ref={messageListRef}
      sx={{
        flexGrow: 1,
        overflowY: 'auto',
        p: { xs: 1.5, sm: 2.5 },
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        bgcolor: '#f8fafc',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(100,116,139,0.25)',
          borderRadius: '10px',
        },
      }}
    >
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} thickness={4} />
        </Box>
      ) : (
        <>
          {hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
              <Chip
                label={loadPreviousMessagesText}
                size="small"
                onClick={onLoadMore}
                sx={{
                  bgcolor: '#ffffff',
                  color: '#2563eb',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'rgba(37, 99, 235, 0.08)',
                  },
                }}
              />
            </Box>
          )}

          {messages.map((msg) => {
            const dateLabel = msg.createdAt?.seconds
              ? formatDateDivider(msg.createdAt.seconds * 1000)
              : '';
            const shouldRenderDateDivider = dateLabel && dateLabel !== lastDateDivider;
            if (dateLabel) {
              lastDateDivider = dateLabel;
            }

            return (
              <React.Fragment key={msg.id}>
                {shouldRenderDateDivider && (
                  <Stack alignItems="center" sx={{ my: 2 }}>
                    <Chip
                      label={dateLabel}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(241, 245, 249, 0.95)',
                        color: '#64748b',
                        fontWeight: 600,
                        fontSize: '0.725rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        py: 0.25,
                      }}
                    />
                  </Stack>
                )}
                <Message
                  userId={msg.senderId}
                  text={msg.text}
                  createdAt={msg.createdAt}
                  avatarUrl={partnerAvatarUrl}
                  myAvatarUrl={myAvatarUrl}
                  attachmentUrl={msg.attachmentUrl}
                  attachmentType={msg.attachmentType}
                  fileName={msg.fileName}
                />
              </React.Fragment>
            );
          })}
        </>
      )}
    </Box>
  );
};
