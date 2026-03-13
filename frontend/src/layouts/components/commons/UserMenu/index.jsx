import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from 'react-i18next';
import { Button, Menu, Stack, Typography } from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";

import { confirmModal } from "../../../../utils/sweetalert2Modal";
import errorHandling from "../../../../utils/errorHandling";

import { removeUserInfo } from "../../../../redux/userSlice";

import { ROLES_NAME, ROUTES } from "../../../../configs/constants";
import tokenService from "../../../../services/tokenService";
import {
  resetSearchCompany,
  resetSearchJobPostFilter,
  resetSearchResume,
} from "../../../../redux/filterSlice";

const UserMenu = ({ anchorElUser, open, handleCloseUserMenu }) => {
  const { t } = useTranslation('common');
  const nav = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  const jobSeekerUserMenu = React.useMemo(() => [
    {
      label: t('nav.accountManagement'),
      path: ROUTES.JOB_SEEKER.DASHBOARD,
    },
  ], [t]);

  const employerUserMenu = React.useMemo(() => [
    {
      label: t('footer.employerDashboard'),
      path: ROUTES.EMPLOYER.DASHBOARD,
    },
  ], [t]);

  const menuItems = React.useMemo(() => {
    return currentUser.roleName === ROLES_NAME.JOB_SEEKER
      ? jobSeekerUserMenu
      : currentUser.roleName === ROLES_NAME.EMPLOYER
      ? employerUserMenu
      : [];
  }, [currentUser, jobSeekerUserMenu, employerUserMenu]);

  const handleLogout = () => {
    const accessToken = tokenService.getAccessTokenFromCookie();
    const backend = tokenService.getProviderFromCookie();
    dispatch(removeUserInfo({ accessToken, backend }))
      .unwrap()
      .then(() => {
        dispatch(resetSearchJobPostFilter());
        dispatch(resetSearchCompany());
        dispatch(resetSearchResume());

        nav(`/${ROUTES.AUTH.LOGIN}`);
      })
      .catch((error) => {
        errorHandling(error);
      });
  };

  return (
    <Menu
      anchorEl={anchorElUser}
      id="account-menu"
      open={open}
      onClose={handleCloseUserMenu}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      <Stack spacing={1} sx={{ p: 1 }}>
        {menuItems.map((item) => (
          <Link to={`/${item.path}`} key={item.path}>
            <Button
              color="primary"
              variant="text"
              sx={{ textTransform: "inherit" }}
              fullWidth
            >
              <Typography marginRight="auto"> {item.label}</Typography>
            </Button>
          </Link>
        ))}
        <Button
          startIcon={<LogoutIcon style={{ marginLeft: 4 }} />}
          variant="text"
          color="error"
          sx={{ textTransform: "inherit" }}
          fullWidth
          onClick={() => {
            handleCloseUserMenu();
            confirmModal(
              handleLogout,
              t('nav.logoutTitle'),
              t('nav.logoutConfirm'),
              "question"
            );
          }}
        >
          <Typography marginRight="auto">{t('nav.logout')}</Typography>
        </Button>
      </Stack>
    </Menu>

  );

};

export default UserMenu;
