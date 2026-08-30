'use client';
import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Stack, Drawer, useTheme, useMediaQuery } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import { ROLES_NAME } from '../../../configs/constants';
import { RootState } from '../../../redux/store';
import { useChatContext } from '../../../context/ChatProvider';

// page components
import RightSidebar from '../../components/chats/RightSidebar';
import ChatWindow from '../../components/chats/ChatWindow';
import LeftSidebar from '../../components/chats/LeftSidebar';
import SidebarHeader from '../../../components/Features/Chats/SidebarHeader';

const ChatLeftSidebar = ({ isJobSeeker }: { isJobSeeker: boolean }) => (
  <Box px={{ xs: 1.5, sm: 2 }} py={2} sx={{ height: '100%', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
    <Stack spacing={2} sx={{ height: '100%' }}>
      <Box>
        <SidebarHeader />
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {isJobSeeker ? <LeftSidebar /> : <LeftSidebar.Employer />}
      </Box>
    </Stack>
  </Box>
);

const ChatRightSidebar = ({ isJobSeeker }: { isJobSeeker: boolean }) => (
  <Box px={{ xs: 1.5, sm: 2 }} py={2} sx={{ height: '100%', bgcolor: 'background.paper' }}>
    {isJobSeeker ? <RightSidebar /> : <RightSidebar.Employer />}
  </Box>
);

const ChatPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));

  const { currentUser } = useSelector((state: RootState) => state.user);
  const { selectedRoomId, setSelectedRoomId } = useChatContext();

  const [openRightDrawer, setOpenRightDrawer] = React.useState(false);
  const isJobSeeker = currentUser?.roleName === ROLES_NAME.JOB_SEEKER;

  // Mobile View Logic: When a room is selected, display ChatWindow. When not, display LeftSidebar.
  if (isMobile) {
    return (
      <Box sx={{ height: '100dvh', minHeight: '100dvh', bgcolor: 'background.default', overflow: 'hidden' }}>
        {!selectedRoomId ? (
          <Box sx={{ height: '100%' }}>
            <ChatLeftSidebar isJobSeeker={isJobSeeker} />
          </Box>
        ) : (
          <Box sx={{ height: '100%' }}>
            <ChatWindow
              isMobile={true}
              onBackToList={() => setSelectedRoomId('')}
              onToggleRightDrawer={() => setOpenRightDrawer(true)}
            />
          </Box>
        )}

        <Drawer
          anchor="right"
          open={openRightDrawer}
          onClose={() => setOpenRightDrawer(false)}
          slotProps={{
            paper: {
              sx: {
                width: '85%',
                maxWidth: 360,
                bgcolor: 'background.paper',
              },
            },
          }}
        >
          <ChatRightSidebar isJobSeeker={isJobSeeker} />
        </Drawer>
      </Box>
    );
  }

  return (
    <Grid container sx={{ height: '100dvh', minHeight: '100dvh', bgcolor: 'background.default', overflow: 'hidden' }}>
      {/* Left Sidebar */}
      <Grid
        sx={{
          height: '100dvh',
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
        size={{
          xs: 12,
          sm: 4.5,
          md: 3.5,
          lg: 3,
        }}
      >
        <ChatLeftSidebar isJobSeeker={isJobSeeker} />
      </Grid>

      {/* Main Chat Window */}
      <Grid
        sx={{
          height: '100dvh',
          bgcolor: '#f8fafc',
        }}
        size={{
          xs: 12,
          sm: 7.5,
          md: isMedium ? 8.5 : 5.5,
          lg: 6,
        }}
      >
        <ChatWindow
          isMobile={false}
          onToggleRightDrawer={isMedium ? () => setOpenRightDrawer(true) : undefined}
        />
      </Grid>

      {/* Right Sidebar */}
      {isMedium ? (
        <Drawer
          anchor="right"
          open={openRightDrawer}
          onClose={() => setOpenRightDrawer(false)}
          slotProps={{
            paper: {
              sx: {
                width: '85%',
                maxWidth: 380,
                bgcolor: 'background.paper',
              },
            },
          }}
        >
          <ChatRightSidebar isJobSeeker={isJobSeeker} />
        </Drawer>
      ) : (
        <Grid
          sx={{
            height: '100dvh',
            borderLeft: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            overflow: 'hidden',
          }}
          size={{
            md: 3,
            lg: 3,
          }}
        >
          <ChatRightSidebar isJobSeeker={isJobSeeker} />
        </Grid>
      )}
    </Grid>
  );
};

export default ChatPage;

