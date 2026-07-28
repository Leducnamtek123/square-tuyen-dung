import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import Image from 'next/image';
import { formatMessageDate } from "../../../../utils/dateHelper";
import { useTranslation } from 'react-i18next';
import { useChatContext } from "../../../../context/ChatProvider";
import { getSafeResourceUrl, openResourceUrlSafely } from '@/utils/safeExternalUrl';

interface MessageProps {
  userId: string | number;
  text: string;
  avatarUrl?: string;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  } | null;
  attachmentUrl?: string;
  attachmentType?: string;
  fileName?: string;
}

import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

const Message = ({ userId, text, avatarUrl, createdAt, attachmentUrl, attachmentType, fileName }: MessageProps) => {
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
        maxWidth: "80%",
        mb: 2,
      }}
    >
      {!isMe && (
        <Avatar
          src={avatarUrl}
          alt={t('message.avatarAlt')}
          sx={{ width: 48, height: 48, mr: 1.5, border: '2px solid #e2e8f0' }}
        />
      )}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
        <Typography
          variant="body2"
          sx={{
            px: 1.75,
            py: 1.25,
            mb: 0.5,
            color: isMe ? "white" : "#0f172a",
            background: isMe ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#ffffff',
            border: isMe ? 'none' : '1px solid rgba(148, 163, 184, 0.28)',
            boxShadow: isMe ? '0 10px 18px rgba(37, 99, 235, 0.18)' : '0 8px 18px rgba(15, 23, 42, 0.05)',
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
            borderBottomLeftRadius: isMe ? 14 : 4,
            borderBottomRightRadius: isMe ? 4 : 14,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {text}
        </Typography>
        
        {safeAttachmentUrl && (
          <Box sx={{ mb: 1, p: 0.75, bgcolor: isMe ? "rgba(255,255,255,0.12)" : "#fff", borderRadius: 2, border: isMe ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(148, 163, 184, 0.24)' }}>
            {attachmentType === 'image' ? (
              <Image
                src={safeAttachmentUrl}
                alt={t('message.attachmentImageAlt')}
                width={800}
                height={200}
                unoptimized
                style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 10, cursor: 'pointer' }}
                onClick={() => openResourceUrlSafely(safeAttachmentUrl)}
              />
            ) : (
              <Box 
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: isMe ? 'white' : '#2563eb' }}
                onClick={() => openResourceUrlSafely(safeAttachmentUrl)}
              >
                <FileDownloadOutlinedIcon sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ textDecoration: 'underline' }}>
                  {fileName || t('message.downloadFile')}
                </Typography>
              </Box>
            )}
          </Box>
        )}
        
        <Typography variant="caption" sx={{ color: '#64748b' }}>
          {createdAt?.seconds
            ? formatMessageDate(createdAt?.seconds * 1000)
            : t('sending')}
        </Typography>
      </Box>
      {isMe && (
        <Avatar
          src={avatarUrl}
          alt={t('message.avatarAlt')}
          sx={{ width: 48, height: 48, ml: 1.5, border: '2px solid #e2e8f0' }}
        />
      )}
    </Box>
  );
};

export default Message;
