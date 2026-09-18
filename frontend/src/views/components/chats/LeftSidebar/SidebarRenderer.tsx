import React from 'react';
import { Avatar, Badge, Box, CircularProgress, Skeleton, Stack, Typography } from "@mui/material";
import InfiniteScroll from 'react-infinite-scroll-component';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import ChatRoomSearch from '@/components/Features/Chats/ChatRoomSearch';
import { useTranslation } from 'react-i18next';
import { useChatRooms, ChatRoomData } from './useChatRooms';
import { useDebounce } from '@/hooks';
import { formatMessageTime } from '@/utils/dateHelper';
import type { UserAccount } from './useChatRooms';

const LoadingComponentItem = () => (
  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.5, borderRadius: 2 }}>
    <Skeleton variant="circular" width={48} height={48} sx={{ flexShrink: 0 }} />
    <Stack flex={1} spacing={0.75} sx={{ minWidth: 0 }}>
      <Skeleton variant="rounded" width="60%" height={16} />
      <Skeleton variant="rounded" width="85%" height={14} />
    </Stack>
  </Stack>
);

interface SidebarRendererProps {
  searchPlaceholderKey: string;
  getSubtextName: (user?: UserAccount) => string;
}

const getInitials = (name?: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  return parts[parts.length - 1]?.charAt(0)?.toUpperCase() || name.charAt(0)?.toUpperCase() || 'U';
};

const SidebarRenderer = ({ searchPlaceholderKey, getSubtextName }: SidebarRendererProps) => {
  const { t } = useTranslation('chat');
  const [searchText, setSearchText] = React.useState('');
  const debouncedTextValue = useDebounce(searchText, 300);
  
  const {
    isLoading,
    hasMore,
    chatRooms,
    selectedRoomId,
    handleLoadMore,
    handleSelectRoom,
    currentUserChat
  } = useChatRooms(debouncedTextValue);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Stack spacing={2} sx={{ height: '100%' }}>
        <Box>
          <ChatRoomSearch
            value={searchText}
            setValue={setSearchText}
            placeholder={t(searchPlaceholderKey)}
          />
        </Box>
        
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {isLoading ? (
            <Stack spacing={1}>
              {Array.from(Array(8).keys()).map((value) => (
                <LoadingComponentItem key={value} />
              ))}
            </Stack>
          ) : chatRooms.length === 0 ? (
            <Box
              sx={{
                py: 6,
                px: 2,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(248, 250, 252, 0.6)',
                borderRadius: 3,
                border: '1px dashed #cbd5e1',
                mt: 1,
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: 'primary.50',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                }}
              >
                {searchText.trim() ? (
                  <SearchOffRoundedIcon sx={{ fontSize: 28 }} />
                ) : (
                  <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 28 }} />
                )}
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0f172a', mb: 0.5 }}>
                {searchText.trim() ? t('noSearchResults', 'Không tìm thấy hội thoại phù hợp') : t('noConversationsFound', 'Chưa có cuộc hội thoại nào')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', maxWidth: 220, lineHeight: 1.4 }}>
                {searchText.trim()
                  ? t('tryDifferentKeyword', 'Thử tìm với từ khóa hoặc tên khác')
                  : t('startChatFromRight', 'Chọn việc làm hoặc ứng viên bên phải để bắt đầu nhắn tin')}
              </Typography>
            </Box>
          ) : (
            <InfiniteScroll
              height={'calc(100dvh - 160px)'}
              style={{ overflowY: 'auto', paddingRight: 4 }}
              dataLength={chatRooms.length}
              next={handleLoadMore}
              hasMore={Boolean(hasMore && chatRooms.length >= 20)}
              loader={
                <Stack sx={{ py: 2 }} justifyContent="center">
                  <CircularProgress size={20} color="primary" sx={{ margin: '0 auto' }} />
                </Stack>
              }
            >
              <Stack spacing={0.75}>
                {chatRooms.map((room: ChatRoomData) => {
                  const isSelected = selectedRoomId === room.id;
                  const isUnread = `${room?.recipientId}` === `${currentUserChat?.userId}` && (room?.unreadCount || 0) > 0;
                  const displayName = room?.user?.name || room?.user?.company?.companyName || '---';
                  const rawSubtext = getSubtextName(room?.user) || '';
                  const subtext = (rawSubtext && rawSubtext !== displayName) ? rawSubtext : (room?.user?.email && room.user.email !== displayName ? room.user.email : '');
                  
                  const safeAvatarUrl =
                    room?.user?.avatarUrl &&
                    room.user.avatarUrl.trim() &&
                    room.user.avatarUrl !== 'null' &&
                    room.user.avatarUrl !== 'undefined' &&
                    room.user.avatarUrl !== '[object Object]'
                      ? room.user.avatarUrl
                      : undefined;

                  // Format timestamp if available
                  const timestampSeconds = (room.updatedAt as any)?.seconds;
                  const timeString = timestampSeconds ? formatMessageTime(timestampSeconds * 1000) : '';

                  return (
                    <Box
                      onClick={() => handleSelectRoom(room)}
                      key={room.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2.5,
                        cursor: 'pointer',
                        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                        bgcolor: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                        borderLeft: isSelected ? '3.5px solid #2563eb' : '3.5px solid transparent',
                        boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.08)' : 'none',
                        '&:hover': {
                          bgcolor: isSelected ? 'rgba(37, 99, 235, 0.12)' : 'rgba(241, 245, 249, 0.8)',
                          transform: 'translateX(2px)',
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          variant="dot"
                          sx={{
                            '& .MuiBadge-badge': {
                              backgroundColor: '#22c55e',
                              color: '#22c55e',
                              boxShadow: '0 0 0 2px #fff',
                              '&::after': {
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                content: '""',
                              },
                            },
                          }}
                        >
                          <Avatar
                            src={safeAvatarUrl}
                            alt={displayName}
                            sx={{
                              width: 46,
                              height: 46,
                              bgcolor: 'primary.main',
                              fontSize: '0.95rem',
                              fontWeight: 700,
                              color: '#fff',
                              border: '1.5px solid #e2e8f0',
                              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.06)',
                            }}
                          >
                            {getInitials(displayName)}
                          </Avatar>
                        </Badge>

                        <Stack flex={1} sx={{ minWidth: 0 }} spacing={0.25}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography
                              variant="subtitle2"
                              noWrap
                              sx={{
                                fontWeight: isUnread ? 700 : 600,
                                fontSize: '0.9rem',
                                color: isUnread ? '#0f172a' : '#1e293b',
                              }}
                            >
                              {displayName}
                            </Typography>
                            {timeString && (
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: '0.725rem',
                                  color: isUnread ? '#2563eb' : '#94a3b8',
                                  fontWeight: isUnread ? 600 : 400,
                                  flexShrink: 0,
                                  ml: 0.5,
                                }}
                              >
                                {timeString}
                              </Typography>
                            )}
                          </Stack>

                          {subtext && (
                            <Typography
                              variant="caption"
                              noWrap
                              sx={{
                                color: '#64748b',
                                fontSize: '0.775rem',
                                display: 'block',
                              }}
                            >
                              {subtext}
                            </Typography>
                          )}

                          {room.lastMessage && (
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography
                                variant="caption"
                                noWrap
                                sx={{
                                  color: isUnread ? '#0f172a' : '#64748b',
                                  fontWeight: isUnread ? 600 : 400,
                                  fontSize: '0.775rem',
                                  maxWidth: '85%',
                                }}
                              >
                                {room.lastMessage}
                              </Typography>
                              {isUnread && (
                                <Box
                                  sx={{
                                    bgcolor: '#2563eb',
                                    color: '#fff',
                                    borderRadius: '10px',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    px: 0.75,
                                    py: 0.1,
                                    minWidth: 16,
                                    textAlign: 'center',
                                  }}
                                >
                                  {room.unreadCount && room.unreadCount > 9 ? '9+' : room.unreadCount || 1}
                                </Box>
                              )}
                            </Stack>
                          )}
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </InfiniteScroll>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default SidebarRenderer;

