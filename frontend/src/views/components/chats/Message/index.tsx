import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { formatMessageDate } from "../../../../utils/dateHelper";
import defaultTheme from "../../../../themeConfigs/defaultTheme";
import { useTranslation } from 'react-i18next';
import { useChatContext } from "../../../../context/ChatProvider";

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
          alt="avatar 1"
          sx={{ width: 50, height: 50, mr: 2 }}
        />
      )}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
        <Typography
          variant="body2"
          sx={{
            p: 1.5,
            mb: 0.5,
            color: isMe ? "white" : defaultTheme.palette.grey[800],
            backgroundColor: isMe ? "#441da0" : defaultTheme.palette.grey[300],
            borderTopLeftRadius: 6,
            borderTopRightRadius: 6,
            borderBottomLeftRadius: isMe ? 6 : 0,
            borderBottomRightRadius: isMe ? 0 : 6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {text}
        </Typography>
        
        {attachmentUrl && (
          <Box sx={{ mb: 1, p: 0.5, bgcolor: isMe ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", borderRadius: 1 }}>
            {attachmentType === 'image' ? (
              <img 
                src={attachmentUrl} 
                alt="attachment" 
                style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, cursor: 'pointer' }} 
                onClick={() => window.open(attachmentUrl, '_blank')}
              />
            ) : (
              <Box 
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: isMe ? 'white' : 'primary.main' }}
                onClick={() => window.open(attachmentUrl, '_blank')}
              >
                <FileDownloadOutlinedIcon sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ textDecoration: 'underline' }}>
                  {fileName || 'Download File'}
                </Typography>
              </Box>
            )}
          </Box>
        )}
        
        <Typography variant="caption" color="text.secondary">
          {createdAt?.seconds
            ? formatMessageDate(createdAt?.seconds * 1000)
            : t('sending')}
        </Typography>
      </Box>
      {isMe && (
        <Avatar
          src={avatarUrl}
          alt="avatar 1"
          sx={{ width: 50, height: 50, ml: 2 }}
        />
      )}
    </Box>
  );
};

export default Message;
