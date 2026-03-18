// @ts-nocheck
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Box, Chip, Pagination, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { ChatContext } from '../../../../context/ChatProvider';
import jobPostActivityService from '../../../../services/jobPostActivityService';
import MuiImageCustom from '../../../../components/MuiImageCustom';
import {
  addDocument,
  checkChatRoomExists,
  checkExists,
  createUser,
} from '../../../../services/firebaseService';

interface Props {
  [key: string]: any;
}



const pageSize = 12;

const LoadingComponentItem = () => {
  return (
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
};

const RightSidebar = () => {
  const { t } = useTranslation('chat');
  const { setSelectedRoomId } = React.useContext(ChatContext);
  const { currentUser } = useSelector((state) => state.user);
  const { id: userId } = currentUser;
  const [isLoading, setIsLoading] = React.useState(true);
  const [jobPostsApplied, setJobPostsApplied] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const getJobPosts = async () => {
      setIsLoading(true);
      try {
        const resData = await jobPostActivityService.getJobPostChatActivity({
          page: page,
          pageSize: pageSize,
        });
        const data = resData.data;
        setCount(data.count);
        setJobPostsApplied(data.results);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    getJobPosts();
  }, [page]);

  const handleAddRoom = async (partnerId, userData) => {
    let allowCreateNewChatRoom = false;
    const isExists = await checkExists('accounts', partnerId);
    if (!isExists) {
      const createResult = await createUser('accounts', userData, partnerId);
      if (createResult) {
        allowCreateNewChatRoom = true;
      }
    } else {
      allowCreateNewChatRoom = true;
    }

    if (allowCreateNewChatRoom) {
      let chatRoomId = await checkChatRoomExists(
        'chatRooms',
        userId,
        partnerId
      );
      if (chatRoomId === null) {
        chatRoomId = await addDocument('chatRooms', {
          members: [`${userId}`, `${partnerId}`],
          membersString: [`${userId}-${partnerId}`, `${partnerId}-${userId}`],
          recipientId: `${partnerId}`,
          createdBy: `${userId}`,
          unreadCount: 0
        });
      }
      setSelectedRoomId(chatRoomId);
    }
  };

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
        {t('appliedJobs')}
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
        ) : jobPostsApplied.length === 0 ? (
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
              {t('noAppliedJobs')}
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            {jobPostsApplied.map((value) => (
              <Box
                key={value.id}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'background.default',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: 'primary.background',
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => theme.customShadows.card
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
                      src={value?.companyImageUrl}
                    />
                  </Box>
                  <Stack flex={1} minWidth={0}>
                    <Tooltip title={value?.jobPostTitle} arrow placement="top">
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
                        {value?.jobPostTitle || '---'}
                      </Typography>
                    </Tooltip>
                    <Tooltip title={value?.companyName} arrow placement="bottom">
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{
                          color: 'text.secondary',
                          cursor: 'pointer',
                          '&:hover': { color: 'primary.main' }
                        }}
                      >
                        {value?.companyName || '---'}
                      </Typography>
                    </Tooltip>
                  </Stack>
                  <Box>
                    <Chip
                      label={t('sendMessage')}
                      color="primary"
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        handleAddRoom(value?.userId, {
                          userId: value?.userId,
                          name: value?.fullName,
                          email: value?.userEmail,
                          avatarUrl: value?.companyImageUrl,
                          company: {
                            companyId: value?.companyId,
                            slug: value?.companySlug,
                            companyName: value?.companyName,
                            imageUrl: value?.companyImageUrl,
                          },
                        })
                      }
                      sx={{
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: 'primary.background',
                          borderColor: 'primary.main'
                        }
                      }}
                    />
                  </Box>
                </Stack>
              </Box>
            ))}
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
            onChange={(event, newPage) => {
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

const EmployerSidebar = () => {
  const { t } = useTranslation('chat');
  const { setSelectedRoomId } = React.useContext(ChatContext);
  const { currentUser } = useSelector((state) => state.user);
  const { id: userId } = currentUser;
  const [isLoading, setIsLoading] = React.useState(true);
  const [jobPostsApplied, setJobPostsApplied] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const loadJobPostActivity = async (params) => {
      setIsLoading(true);
      try {
        const resData = await jobPostActivityService.getAppliedResumeChat(
          params
        );
        const data = resData.data;
        setCount(data.count);
        setJobPostsApplied(data.results);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadJobPostActivity({
      page: page,
      pageSize: pageSize,
    });
  }, [page]);

  const handleAddRoom = async (partnerId, userData) => {
    let allowCreateNewChatRoom = false;
    const isExists = await checkExists('accounts', partnerId);
    if (!isExists) {
      const createResult = await createUser('accounts', userData, partnerId);
      if (createResult) {
        allowCreateNewChatRoom = true;
      }
    } else {
      allowCreateNewChatRoom = true;
    }

    if (allowCreateNewChatRoom) {
      let chatRoomId = await checkChatRoomExists(
        'chatRooms',
        userId,
        partnerId
      );
      if (chatRoomId === null) {
        chatRoomId = await addDocument('chatRooms', {
          members: [`${userId}`, `${partnerId}`],
          membersString: [`${userId}-${partnerId}`, `${partnerId}-${userId}`],
          recipientId: `${partnerId}`,
          createdBy: `${userId}`,
          unreadCount: 0
        });
      }
      setSelectedRoomId(chatRoomId);
    }
  };

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
        {t('candidates')}
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
        ) : jobPostsApplied.length === 0 ? (
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
              {t('noCandidates')}
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            {jobPostsApplied.map((value) => (
              <Box
                key={value.id}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'background.default',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: 'primary.background',
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => theme.customShadows.card
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
                      src={value?.avatarUrl}
                    />
                  </Box>
                  <Stack flex={1} minWidth={0}>
                    <Tooltip title={value?.fullName} arrow placement="top">
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
                        {value?.fullName || '---'}
                      </Typography>
                    </Tooltip>
                    <Tooltip title={value?.jobPostTitle} arrow placement="bottom">
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{
                          color: 'text.secondary',
                          cursor: 'pointer',
                          '&:hover': { color: 'primary.main' }
                        }}
                      >
                        {value?.jobPostTitle || '---'}
                      </Typography>
                    </Tooltip>
                  </Stack>
                  <Box>
                    <Chip
                      label={t('sendMessage')}
                      color="primary" 
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        handleAddRoom(value?.userId, {
                          userId: value?.userId,
                          name: value?.fullName,
                          email: value?.userEmail,
                          avatarUrl: value?.avatarUrl,
                          company: null,
                        })
                      }
                      sx={{
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: 'primary.background',
                          borderColor: 'primary.main'
                        }
                      }}
                    />
                  </Box>
                </Stack>
              </Box>
            ))}
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
            onChange={(event, newPage) => {
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

RightSidebar.Employer = EmployerSidebar;

export default RightSidebar;
