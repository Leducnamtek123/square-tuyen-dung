import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Stack, Typography, Drawer, IconButton, useTheme, useMediaQuery, Theme } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import GroupIcon from '@mui/icons-material/Group';
import { ROLES_NAME } from '../../../configs/constants';
import { RootState } from '../../../redux/store';
import { useTranslation } from 'react-i18next';

// page components
import RightSidebar from '../../components/chats/RightSidebar';
import ChatWindow from '../../components/chats/ChatWindow';
import LeftSidebar from '../../components/chats/LeftSidebar';
import SidebarHeader from '../../../components/Features/Chats/SidebarHeader';

const ChatPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));

  const { currentUser } = useSelector((state: RootState) => state.user);
  const { t } = useTranslation('chat');

  const [openLeftDrawer, setOpenLeftDrawer] = React.useState(false);
  const [openRightDrawer, setOpenRightDrawer] = React.useState(false);

  const renderLeftSidebar = () => {
    const isJobSeeker = currentUser?.roleName === ROLES_NAME.JOB_SEEKER;
    return (
      <Box px={2} py={2} sx={{ height: '100%', bgcolor: 'background.paper' }}>
        <Stack spacing={2}>
          <Box>
            <SidebarHeader />
          </Box>
          <Box>
            {isJobSeeker ? <LeftSidebar /> : <LeftSidebar.Employer />}
          </Box>
        </Stack>
      </Box>
    );
  };

  const renderRightSidebar = () => {
    const isJobSeeker = currentUser?.roleName === ROLES_NAME.JOB_SEEKER;
    return (
      <Box px={2} py={2}>
        {isJobSeeker ? <RightSidebar /> : <RightSidebar.Employer />}
      </Box>
    );
  };

  return (
    <Grid container sx={{ height: '100vh', bgcolor: 'background.default' }}>
      {/* Left Sidebar */}
      {isMobile ? (
        <Drawer
          anchor="left"
          open={openLeftDrawer}
          onClose={() => setOpenLeftDrawer(false)}
          slotProps={{
            paper: {
              sx: {
                width: '80%',
                maxWidth: 360,
                bgcolor: 'background.paper',
              },
            },
          }}
        >
          {renderLeftSidebar()}
        </Drawer>
      ) : (
        <Grid
          sx={{
            height: '100vh',
            borderRight: 1,
            borderColor: 'divider',
            display: { xs: 'none', sm: 'block' }
          }}
          size={{
            xs: 12,
            sm: 4,
            md: 3
          }}>
          {renderLeftSidebar()}
        </Grid>
      )}

      {/* Main Chat Window */}
      <Grid
        sx={{ 
          height: '100vh',
          bgcolor: 'background.paper',
        }}
        size={{
          xs: 12,
          sm: 8,
          md: 6
        }}>
        <Box sx={{ height: '100%' }}>
          <Stack direction="column" sx={{ height: '100%' }}>
            <Box 
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                p: 2,
                bgcolor: 'background.paper',
                boxShadow: (theme: Theme & { customShadows?: Record<string, string> }) => theme.customShadows?.card,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              {/* Mobile Menu Buttons */}
              {(isMobile || isMedium) && (
                <Stack direction="row" spacing={1}>
                  {isMobile && (
                    <IconButton 
                      onClick={() => setOpenLeftDrawer(true)}
                      sx={{ 
                        bgcolor: 'primary.background',
                        '&:hover': { bgcolor: 'primary.background' }
                      }}
                    >
                      <GroupIcon color="primary" />
                    </IconButton>
                  )}
                  {(isMobile || isMedium) && (
                    <IconButton 
                      onClick={() => setOpenRightDrawer(true)}
                      sx={{ 
                        bgcolor: 'primary.background',
                        '&:hover': { bgcolor: 'primary.background' }
                      }}
                    >
                      <MenuIcon color="primary" />
                    </IconButton>
                  )}
                </Stack>
              )}

              <Typography 
                variant="subtitle1" 
                fontWeight={600}
                sx={{
                  flex: 1,
                  background: (theme: Theme) => theme.palette.primary.main,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center'
                }}
              >
                {t('slogan')}{' '}
                <span>{t('sloganSub')}</span>
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <ChatWindow />
            </Box>
          </Stack>
        </Box>
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
                width: '80%',
                maxWidth: 360,
                bgcolor: 'background.paper',
              },
            },
          }}
        >
          {renderRightSidebar()}
        </Drawer>
      ) : (
        <Grid
          sx={{
            height: '100vh',
            borderLeft: 1,
            borderColor: 'divider',
            display: { xs: 'none', md: 'block' },
            bgcolor: 'background.paper'
          }}
          size={{
            md: 3
          }}>
          {renderRightSidebar()}
        </Grid>
      )}
    </Grid>
  );
};

export default ChatPage;
