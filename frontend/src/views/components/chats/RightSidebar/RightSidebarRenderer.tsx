import React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Box, Button, Pagination, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { useRightSidebarData } from './useRightSidebarData';
import type { RightSidebarFetchResponse, UserDataPayload } from './useRightSidebarData';

const LoadingComponentItem = () => (
  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.5, borderRadius: 2 }}>
    <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 2, flexShrink: 0 }} />
    <Stack flex={1} spacing={0.75} sx={{ minWidth: 0 }}>
      <Skeleton variant="rounded" width="70%" height={16} />
      <Skeleton variant="rounded" width="50%" height={14} />
    </Stack>
    <Skeleton variant="rounded" width={76} height={32} sx={{ borderRadius: 2 }} />
  </Stack>
);

interface RightSidebarRendererProps<T> {
  titleKey: string;
  noDataKey: string;
  fetchData: (params: { page: number; pageSize: number }) => Promise<RightSidebarFetchResponse<T>>;
  mapDataToUI: (item: T) => {
    id: string;
    imageUrl: string;
    primaryText: string;
    secondaryText: string;
    partnerId: string;
    userDataWrapper: UserDataPayload;
  };
}

const getInitials = (name?: string) => {
  if (!name) return 'HR';
  const parts = name.trim().split(' ');
  return parts[parts.length - 1]?.charAt(0)?.toUpperCase() || name.charAt(0)?.toUpperCase() || 'HR';
};

const RightSidebarRenderer = <T,>({ titleKey, noDataKey, fetchData, mapDataToUI }: RightSidebarRendererProps<T>) => {
  const { t } = useTranslation('chat');
  const {
    isLoading,
    dataList,
    page,
    setPage,
    count,
    handleAddRoom,
    pageSize,
    isContextReady
  } = useRightSidebarData(fetchData);

  if (!isContextReady) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: '#475569',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          mb: 2,
        }}
      >
        {t(titleKey)}
      </Typography>

      <Box 
        sx={{ 
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          pr: 0.5,
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(100,116,139,0.2)',
            borderRadius: '4px',
          },
        }}
      >
        {isLoading ? (
          <Stack spacing={1.5}>
            {Array.from(Array(6).keys()).map((value) => (
              <LoadingComponentItem key={value} />
            ))}
          </Stack>
        ) : dataList.length === 0 ? (
          <Stack 
            spacing={1.5} 
            alignItems="center" 
            justifyContent="center" 
            sx={{ 
              py: 8,
              px: 2,
              bgcolor: 'rgba(248, 250, 252, 0.7)',
              borderRadius: 3,
              border: '1px dashed #cbd5e1',
              textAlign: 'center',
            }}
          >
            <InboxOutlinedIcon sx={{ fontSize: 40, color: '#94a3b8' }} />
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
              {t(noDataKey)}
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={1.25}>
            {dataList.map((value) => {
              const mapped = mapDataToUI(value);
              const canStartChat = Boolean(String(mapped.partnerId || '').trim());
              return (
                <Box
                  key={mapped.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    bgcolor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                    '&:hover': {
                      borderColor: '#cbd5e1',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 16px -2px rgba(15, 23, 42, 0.06)',
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      src={mapped.imageUrl}
                      alt={mapped.primaryText}
                      variant="rounded"
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: 'primary.50',
                        color: 'primary.main',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        border: '1px solid #e2e8f0',
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(mapped.primaryText || mapped.secondaryText)}
                    </Avatar>

                    <Stack flex={1} sx={{ minWidth: 0 }} spacing={0.25}>
                      <Tooltip title={mapped.primaryText || ''} arrow placement="top">
                        <Typography
                          variant="subtitle2"
                          noWrap
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: '#0f172a',
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main' },
                          }}
                        >
                          {mapped.primaryText || '---'}
                        </Typography>
                      </Tooltip>
                      <Tooltip title={mapped.secondaryText || ''} arrow placement="bottom">
                        <Typography
                          variant="caption"
                          noWrap
                          sx={{
                            color: '#64748b',
                            fontSize: '0.775rem',
                            display: 'block',
                          }}
                        >
                          {mapped.secondaryText || '---'}
                        </Typography>
                      </Tooltip>
                    </Stack>

                    <Box sx={{ flexShrink: 0 }}>
                      <Button
                        variant="contained"
                        size="small"
                        disableElevation
                        startIcon={<ChatBubbleOutlineRoundedIcon style={{ fontSize: 15 }} />}
                        disabled={!canStartChat}
                        onClick={() => {
                          if (!canStartChat) return;
                          handleAddRoom(mapped.partnerId, mapped.userDataWrapper);
                        }}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 1.5,
                          py: 0.6,
                          fontSize: '0.775rem',
                          bgcolor: '#2563eb',
                          boxShadow: '0 2px 6px rgba(37, 99, 235, 0.18)',
                          '&:hover': {
                            bgcolor: '#1d4ed8',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.28)',
                          },
                          '&:active': {
                            transform: 'scale(0.96)',
                          },
                        }}
                      >
                        {t('sendMessage', 'Nhắn tin')}
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      {Math.ceil(count / pageSize) > 1 && (
        <Stack 
          sx={{ 
            pt: 1.5,
            mt: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
          }} 
          alignItems="center"
        >
          <Pagination
            color="primary"
            size="small"
            shape="rounded"
            count={Math.ceil(count / pageSize)}
            page={page}
            onChange={(_event, newPage) => {
              setPage(newPage);
            }}
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 1.5,
                fontSize: '0.75rem',
              },
            }}
          />
        </Stack>
      )}
    </Box>
  );
};

export default RightSidebarRenderer;

