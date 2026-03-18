// @ts-nocheck
import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from 'react-i18next';
import { Button, Menu, Stack, Typography } from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";

import { confirmModal } from "../../../../utils/sweetalert2Modal";
import errorHandling from "../../../../utils/errorHandling";

import { removeUserInfo } from "../../../../redux/userSlice";
import { setActiveWorkspace } from "../../../../redux/userSlice";

import { HOST_NAME, ROUTES } from "../../../../configs/constants";
import { buildPortalPath, getPreferredLanguage } from "../../../../configs/portalRouting";
import tokenService from "../../../../services/tokenService";
import {
  resetSearchCompany,
  resetSearchJobPostFilter,
  resetSearchResume,
} from "../../../../redux/filterSlice";

interface Props {
  [key: string]: any;
}



const UserMenu = ({ anchorElUser, open, handleCloseUserMenu }) => {
  const { t } = useTranslation('common');
  const nav = useNavigate();
  const dispatch = useDispatch();
  const { currentUser, activeWorkspace } = useSelector((state) => state.user);

  const workspaces = useMemo(() => currentUser?.workspaces || [], [currentUser?.workspaces]);

  const openPortal = (toEmployer = false, path = "") => {
    const normalizedPath = path ? `/${path.replace(/^\/+/, "")}` : "";
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : "";
    const mainHost = HOST_NAME.PROJECT;
    const language = getPreferredLanguage();
    const targetUrl = toEmployer
      ? `${protocol}//${mainHost}${port}${buildPortalPath("employer", normalizedPath, language)}`
      : `${protocol}//${mainHost}${port}${normalizedPath}`;
    window.location.href = targetUrl;
  };

  const menuItems = React.useMemo(() => {
    const items = [];
    workspaces.forEach((workspace) => {
      const key = `${workspace.type}-${workspace.companyId || "candidate"}`;
      const isSelected =
        workspace.type === activeWorkspace?.type &&
        (workspace.type !== "company" ||
          Number(workspace.companyId) === Number(activeWorkspace?.companyId));

      items.push({
        key,
        isSelected,
        label:
          workspace.type === "company"
            ? `${workspace.label} (${workspace.roleCode || "member"})`
            : t("nav.accountManagement"),
        onClick: () => {
          dispatch(setActiveWorkspace(workspace));
          if (workspace.type === "company") {
            openPortal(true, ROUTES.EMPLOYER.DASHBOARD);
            return;
          }
          openPortal(false, ROUTES.JOB_SEEKER.DASHBOARD);
        },
      });
    });
    return items;
  }, [activeWorkspace, dispatch, t, workspaces]);

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
          <Button
            key={item.key}
            color="primary"
            variant="text"
            sx={{ textTransform: "inherit" }}
            fullWidth
            onClick={() => {
              handleCloseUserMenu();
              item.onClick();
            }}
          >
            <Typography
              marginRight="auto"
              sx={{
                fontWeight: item.isSelected ? 600 : 400,
                color: item.isSelected ? "primary.main" : "text.primary",
              }}
            >
              {item.label}
            </Typography>
          </Button>
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
