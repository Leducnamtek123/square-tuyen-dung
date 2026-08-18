'use client';

import React from 'react';
import {
  Box,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import Image from 'next/image';
import { CHATBOT_ICONS } from '@/configs/images';
import { type AgentMessage } from '@/services/agentAssistantService';
import { MessageResponse } from '@/components/Features/AiElements/message';
import { ToolStepCard } from './ToolStepCard';

const isImagePart = (part: unknown): part is { type: 'image'; dataUrl: string; name?: string } =>
  Boolean(
    part &&
      typeof part === 'object' &&
      'type' in part &&
      (part as { type: string }).type === 'image' &&
      'dataUrl' in part &&
      typeof (part as { dataUrl: string }).dataUrl === 'string',
  );

type MessageItemProps = {
  message: AgentMessage;
};

export const MessageItem = ({ message }: MessageItemProps) => {
  const isUser = message.role === 'user';
  const isOptimistic = Boolean(message.metadata?.optimistic);
  const imageParts = (message.parts || []).filter(isImagePart);
  const toolCalls = message.toolCalls || [];

  return (
    <Box sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', mb: 0.5 }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ maxWidth: { xs: '96%', md: '82%' } }}>
        {!isUser && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              mt: 0.25,
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
              border: '1px solid #DBEAFE',
              overflow: 'hidden',
            }}
          >
            <Image
              src={CHATBOT_ICONS.EMPLOYER}
              alt="AILA AI"
              width={32}
              height={32}
              style={{ objectFit: 'contain' }}
            />
          </Box>
        )}

        <Stack
          spacing={1}
          sx={{
            minWidth: isUser ? 0 : { xs: 'min(94%, 320px)', md: 'min(74%, 420px)' },
            px: isUser ? 2 : 2.5,
            py: isUser ? 1.1 : 1.75,
            borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            bgcolor: isUser ? '#2563EB' : '#FFFFFF',
            color: isUser ? '#FFFFFF' : '#111827',
            border: isUser ? 'none' : '1px solid #E5E7EB',
            boxShadow: isUser
              ? '0 2px 8px rgba(37, 99, 235, 0.18)'
              : '0 1px 4px rgba(0, 0, 0, 0.04)',
            opacity: isOptimistic ? 0.82 : 1,
            transition: 'all 100ms ease-in-out',
          }}
        >
          {toolCalls.length ? (
            <Stack spacing={1} sx={{ mb: 1 }}>
              {toolCalls.map((tc) => (
                <ToolStepCard key={tc.id || tc.toolName} toolCall={tc} />
              ))}
            </Stack>
          ) : null}

          {imageParts.length ? (
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
              {imageParts.map((part, partIdx) => (
                <Box
                  key={part.dataUrl || part.name || `img-part-${partIdx}`}
                  component="img"
                  src={part.dataUrl}
                  alt={part.name || `attachment-${partIdx + 1}`}
                  sx={{
                    width: 144,
                    maxWidth: '100%',
                    aspectRatio: '4 / 3',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: isUser ? alpha('#fff', 0.3) : '#E5E7EB',
                    bgcolor: isUser ? alpha('#fff', 0.08) : '#F8FAFC',
                  }}
                />
              ))}
            </Stack>
          ) : null}

          {message.content ? (
            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ width: '100%' }}>
              {!isUser && isOptimistic ? (
                <CircularProgress size={16} sx={{ mt: 0.4, color: '#2563EB' }} />
              ) : null}
              {isUser ? (
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                    fontWeight: 500,
                    fontSize: '0.9375rem',
                    color: '#FFFFFF !important',
                  }}
                >
                  {message.content}
                </Typography>
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    overflowWrap: 'anywhere',
                    fontSize: '0.9375rem',
                    lineHeight: 1.6,
                    color: '#111827',
                  }}
                >
                  <MessageResponse enableRich>{message.content}</MessageResponse>
                </Box>
              )}
            </Stack>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
};
