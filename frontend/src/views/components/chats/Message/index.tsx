import React from "react";
import { Box, Typography, Avatar, Stack } from "@mui/material";
import Image from 'next/image';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { formatMessageDate } from "../../../../utils/dateHelper";
import { useTranslation } from 'react-i18next';
import { useChatContext } from "../../../../context/ChatProvider";
import { getSafeResourceUrl, openResourceUrlSafely } from '@/utils/safeExternalUrl';

interface MessageProps {
  userId: string | number;
  text: string;
  avatarUrl?: string;
  myAvatarUrl?: string;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  } | null;
  attachmentUrl?: string;
  attachmentType?: string;
  fileName?: string;
}

const getInitials = (name?: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  return parts[parts.length - 1]?.charAt(0)?.toUpperCase() || name.charAt(0)?.toUpperCase() || 'U';
};

const Message = ({
  userId,
  text,
  avatarUrl,
  myAvatarUrl,
  createdAt,
  attachmentUrl,
  attachmentType,
  fileName,
}: MessageProps) => {
  const { t } = useTranslation('chat');
  const { currentUserChat } = useChatContext();

  const isMe = `${currentUserChat?.userId}` === `${userId}`;
  const safeAttachmentUrl = getSafeResourceUrl(attachmentUrl);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignSelf: isMe ? "flex-end" : "flex-start",
        justifyContent: isMe ? "flex-end" : "flex-start",
        maxWidth: { xs: "92%", sm: "78%" },
        mb: 1.5,
      }}
    >
      {!isMe && (
        <Avatar
          src={avatarUrl}
          alt={t('message.avatarAlt', 'Avatar')}
          sx={{
            width: 36,
            height: 36,
            mr: 1.25,
            mt: 0.5,
            border: '1.5px solid #e2e8f0',
            bgcolor: 'primary.main',
            fontSize: '0.85rem',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {getInitials()}
        </Avatar>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", minWidth: 0 }}>
        {text && (
          <Box
            sx={{
              px: 2,
              py: 1.25,
              mb: 0.5,
              color: isMe ? "#ffffff" : "#0f172a",
              background: isMe
                ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                : '#ffffff',
              border: isMe ? 'none' : '1px solid #e2e8f0',
              boxShadow: isMe
                ? '0 4px 14px rgba(37, 99, 235, 0.16)'
                : '0 2px 8px rgba(15, 23, 42, 0.04)',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              borderBottomLeftRadius: isMe ? 16 : 4,
              borderBottomRightRadius: isMe ? 4 : 16,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: '0.925rem',
              lineHeight: 1.5,
            }}
          >
            {text}
          </Box>
        )}

        {safeAttachmentUrl && (
          <Box
            sx={{
              mb: 0.75,
              p: attachmentType === 'image' ? 0.5 : 1.25,
              bgcolor: isMe ? "rgba(37, 99, 235, 0.08)" : "#ffffff",
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
              maxWidth: 320,
            }}
          >
            {attachmentType === 'image' ? (
              <Box
                sx={{
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative',
                  '&:hover img': {
                    transform: 'scale(1.02)',
                  },
                }}
                onClick={() => openResourceUrlSafely(safeAttachmentUrl)}
              >
                <Image
                  src={safeAttachmentUrl}
                  alt={t('message.attachmentImageAlt', 'Hình ảnh đính kèm')}
                  width={600}
                  height={400}
                  unoptimized
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: 220,
                    objectFit: 'cover',
                    borderRadius: 10,
                    transition: 'transform 0.2s ease',
                  }}
                />
              </Box>
            ) : (
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                  cursor: 'pointer',
                  p: 0.5,
                }}
                onClick={() => openResourceUrlSafely(safeAttachmentUrl)}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <InsertDriveFileRoundedIcon sx={{ fontSize: 22 }} />
                </Box>
                <Stack flex={1} sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{
                      fontWeight: 600,
                      color: '#0f172a',
                      fontSize: '0.85rem',
                    }}
                  >
                    {fileName || t('message.downloadFile', 'Tải tài liệu')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.725rem' }}>
                    {t('clickToDownload', 'Nhấn để tải về')}
                  </Typography>
                </Stack>
                <FileDownloadOutlinedIcon sx={{ color: '#2563eb', fontSize: 20 }} />
              </Stack>
            )}
          </Box>
        )}

        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ px: 0.5 }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
            {createdAt?.seconds
              ? formatMessageDate(createdAt.seconds * 1000)
              : t('sending', 'Đang gửi...')}
          </Typography>
          {isMe && createdAt?.seconds && (
            <DoneAllRoundedIcon sx={{ fontSize: 13, color: '#2563eb' }} />
          )}
        </Stack>
      </Box>

      {isMe && myAvatarUrl && (
        <Avatar
          src={myAvatarUrl}
          alt={t('message.avatarAlt', 'Avatar')}
          sx={{
            width: 36,
            height: 36,
            ml: 1.25,
            mt: 0.5,
            border: '1.5px solid #e2e8f0',
            bgcolor: 'primary.main',
            fontSize: '0.85rem',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {getInitials(currentUserChat?.name)}
        </Avatar>
      )}
    </Box>
  );
};

export default Message;
