import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import { AppBar, Avatar, Box, Card, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import UserMenu from '../../commons/UserMenu';
import AccountSwitchMenu from '../../commons/AccountSwitchMenu';
const NotificationCard = React.lazy(() => import('../../../../components/NotificationCard'));
const ChatCard = React.lazy(() => import('../../../../components/ChatCard'));
import LanguageSwitcher from '../../commons/LanguageSwitcher';

interface HeaderProps {
  drawerWidth: number;
  handleDrawerToggle: () => void;
}

const Header = ({ drawerWidth, handleDrawerToggle }: HeaderProps) => {
  const { currentUser, isAuthenticated } = useAppSelector((state) => state.user);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const authArea = (
    <Box sx={{ flexGrow: 0, ml: 1 }}>
      <Card
        variant="outlined"
        onClick={handleOpenUserMenu}
        sx={{
          p: 0.5,
          borderRadius: 50,
          backgroundColor: 'transparent',
          borderColor: '#7e57c2',
          cursor: 'pointer',
        }}
      >
        <Stack direction="row" justifyContent="center" alignItems="center">
          <Avatar alt={currentUser?.fullName} src={currentUser?.avatarUrl ?? undefined} />
          <Typography
            variant="subtitle1"
            sx={{
              px: 1,
              color: 'white',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {currentUser?.fullName}
          </Typography>
        </Stack>
      </Card>
      <UserMenu
        anchorElUser={anchorElUser}
        open={Boolean(anchorElUser)}
        handleCloseUserMenu={handleCloseUserMenu}
      />
    </Box>
  );

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { xl: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { xl: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <AccountSwitchMenu />
        </Toolbar>
        <Toolbar>
          <LanguageSwitcher />
          {isAuthenticated && (
            <React.Suspense fallback={<Box width={40} />}>
              <NotificationCard />
            </React.Suspense>
          )}
          {isAuthenticated && (
            <React.Suspense fallback={<Box width={40} />}>
              <ChatCard />
            </React.Suspense>
          )}
          {authArea}
        </Toolbar>
      </Stack>
    </AppBar>
  );
};

export default Header;
