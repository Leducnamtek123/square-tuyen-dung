import React from 'react';
import { Box, CircularProgress, Skeleton, Stack, Typography } from "@mui/material";
import InfiniteScroll from 'react-infinite-scroll-component';
import CircleIcon from '@mui/icons-material/Circle';
import NoDataCard from '../../../../components/Common/NoDataCard';
import MuiImageCustom from '../../../../components/Common/MuiImageCustom';
import ChatRoomSearch from '../../../../components/Features/Chats/ChatRoomSearch';
import { useTranslation } from 'react-i18next';
import { useChatRooms, ChatRoomData } from './useChatRooms';
import { useDebounce } from '../../../../hooks';

const LoadingComponentItem = () => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Box>
      <Skeleton variant="circular" width={54} height={54} />
    </Box>
    <Stack flex={1} spacing={1}>
      <Skeleton variant="rounded" />
      <Skeleton variant="rounded" />
    </Stack>
  </Stack>
);

interface SidebarRendererProps {
  searchPlaceholderKey: string;
  getSubtextName: (user?: import('./useChatRooms').UserAccount) => string;
}

const SidebarRenderer = ({ searchPlaceholderKey, getSubtextName }: SidebarRendererProps) => {
  const { t } = useTranslation('chat');
  const [searchText, setSearchText] = React.useState('');
  const deboundedTextValue = useDebounce(searchText, 500);
  
  const {
    isLoading,
    hasMore,
    chatRooms,
    handleLoadMore,
    handleSelectRoom,
    currentUserChat
  } = useChatRooms();

  return (
    <Box>
      <Stack spacing={2}>
        <Box>
          <ChatRoomSearch
            value={searchText}
            setValue={setSearchText}
            placeholder={t(searchPlaceholderKey)}
          />
        </Box>
        <Box sx={{ height: '75vh', overflowY: 'auto' }}>
          {isLoading ? (
            <Stack spacing={2} overflow={'hidden'} height="100%">
              {Array.from(Array(12).keys()).map((value) => (
                <LoadingComponentItem key={value} />
              ))}
            </Stack>
          ) : chatRooms.length === 0 ? (
            <NoDataCard
              title={t('noConversationsFound')}
              svgKey="ImageSvg15"
            />
          ) : (
            <Stack spacing={1}>
              <InfiniteScroll
                height={'75vh'}
                style={{ overflowY: 'auto' }}
                dataLength={chatRooms.length}
                next={handleLoadMore}
                hasMore={hasMore}
                loader={
                  <Stack sx={{ py: 2 }} justifyContent="center">
                    <CircularProgress color="secondary" sx={{ margin: '0 auto' }} />
                  </Stack>
                }
              >
                {chatRooms.map((value: ChatRoomData) => (
                  <Stack
                    onClick={() => handleSelectRoom(value)}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    key={value.id}
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      '&:hover': { backgroundColor: '#ede7f6' },
                    }}
                  >
                    <Box>
                      <MuiImageCustom
                        width={54}
                        height={54}
                        sx={{
                          borderRadius: 50,
                          border: 1,
                          borderColor: '#e0e0e0',
                          p: 0.25,
                        }}
                        src={`${value?.user?.avatarUrl}`}
                      />
                    </Box>
                    <Stack flex={1} width={'50%'}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer',
                        }}
                      >
                        {`${value?.user?.name}` || '---'}
                      </span>
                      <Typography
                        variant="caption"
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer',
                        }}
                      >
                        {getSubtextName(value?.user) || '---'}
                      </Typography>
                    </Stack>
                    <Box>
                      {`${value?.recipientId}` === `${currentUserChat?.userId}` &&
                        (value?.unreadCount || 0) > 0 && (
                          <CircleIcon style={{ color: '#2979ff', fontSize: 12 }} />
                        )}
                    </Box>
                  </Stack>
                ))}
              </InfiniteScroll>
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default SidebarRenderer;
