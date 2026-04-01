import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Pagination, Skeleton, Stack, Tooltip, Typography, Theme, Button } from "@mui/material";
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import MuiImageCustom from '../../../../components/Common/MuiImageCustom';
import { useRightSidebarData } from './useRightSidebarData';
import type { UserDataPayload } from './useRightSidebarData';

const LoadingComponentItem = () => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Box>
      <Skeleton variant="circular" width={54} height={54} />
    </Box>
    <Stack flex={1} spacing={1} width={'50%'}>
      <Skeleton variant="rounded" />
      <Skeleton variant="rounded" />
    </Stack>
    <Box>
      <Skeleton variant="rounded" width={80} height={25} />
    </Box>
  </Stack>
);

interface RightSidebarRendererProps<T> {
  titleKey: string;
  noDataKey: string;
  fetchData: (params: { page: number; pageSize: number }) => Promise<{ count: number; results: T[] }>;
  mapDataToUI: (item: T) => {
    id: string;
    imageUrl: string;
    primaryText: string;
    secondaryText: string;
    partnerId: string;
    userDataWrapper: UserDataPayload;
  };
}

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
    <Box>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          fontSize: 13,
          fontWeight: 700,
          color: 'text.secondary',
          letterSpacing: '0.5px',
          mb: 2
        }}
      >
        {t(titleKey)}
      </Typography>
      <Box 
        sx={{ 
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto',
          pr: 1,
          '&::-webkit-scrollbar': {
            width: '4px',
          },
        }}
      >
        {isLoading ? (
          <Stack spacing={2}>
            {Array.from(Array(pageSize).keys()).map((value) => (
              <LoadingComponentItem key={value} />
            ))}
          </Stack>
        ) : dataList.length === 0 ? (
          <Stack 
            spacing={2} 
            alignItems="center" 
            justifyContent="center" 
            sx={{ 
              py: 8,
              px: 2,
              bgcolor: 'background.default',
              borderRadius: 2
            }}
          >
            <InboxOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.secondary">
              {t(noDataKey)}
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            {dataList.map((value) => {
              const mapped = mapDataToUI(value);
              return (
                <Box
                  key={mapped.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'background.default',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
                      transform: 'translateY(-2px)',
                      boxShadow: (theme: Theme) => (theme as Theme & { customShadows?: { card: string } }).customShadows?.card
                    }
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box>
                      <MuiImageCustom
                        width={48}
                        height={48}
                        sx={{
                          borderRadius: 2,
                          border: 1,
                          borderColor: 'divider',
                          p: 0.5,
                        }}
                        src={mapped.imageUrl}
                      />
                    </Box>
                    <Stack flex={1} minWidth={0}>
                      <Tooltip title={mapped.primaryText || ''} arrow placement="top">
                        <Typography
                          variant="subtitle2"
                          noWrap
                          sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main' }
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
                            color: 'text.secondary',
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main' }
                          }}
                        >
                          {mapped.secondaryText || '---'}
                        </Typography>
                      </Tooltip>
                    </Stack>
                    <Box>
                      <Button
                        variant="contained"
                        size="small"
                        disableElevation
                        onClick={() => handleAddRoom(mapped.partnerId, mapped.userDataWrapper)}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 2,
                          py: 0.5,
                          fontSize: '0.8125rem',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                          }
                        }}
                      >
                        {t('sendMessage')}
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
            pt: 2,
            mt: 2,
            borderTop: 1,
            borderColor: 'divider'
          }} 
          alignItems="center"
        >
          <Pagination
            color="primary"
            size="small"
            shape="rounded"
            variant="outlined"
            count={Math.ceil(count / pageSize)}
            page={page}
            onChange={(_event, newPage) => {
              setPage(newPage);
            }}
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 1
              }
            }}
          />
        </Stack>
      )}
    </Box>
  );
};

export default RightSidebarRenderer;
