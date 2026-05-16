'use client';
import React, { useMemo } from "react";
import { useAppSelector } from '@/redux/hooks';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from "react-redux";
import { useTranslation } from 'react-i18next';
import { Button, Menu, Stack, Typography } from "@mui/material";

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';
import LogoutIcon from "@mui/icons-material/Logout";
import Feedback from '@/components/Features/Feedback';

import { confirmModal } from "../../../../utils/sweetalert2Modal";
import errorHandling from "../../../../utils/errorHandling";

import { removeUserInfo } from "../../../../redux/userSlice";
import { setActiveWorkspace } from "../../../../redux/userSlice";

import { HOST_NAME, ROLES_NAME, ROUTES } from "../../../../configs/constants";
import { buildPortalPath, isAdminPortalPath } from "../../../../configs/portalRouting";
import tokenService from "../../../../services/tokenService";
import type { Workspace } from '@/types/models';
import type { ApiError } from '../../../../types/api';
import type { AxiosError } from 'axios';
import type { AppDispatch } from '../../../../redux/store';
import {
  resetSearchCompany,
  resetSearchJobPostFilter,
  resetSearchResume,
} from "../../../../redux/filterSlice";

interface UserMenuProps {
  anchorElUser: HTMLElement | null;
  open: boolean;
  handleCloseUserMenu: () => void;
}

interface WorkspaceItem {
  type: "company" | "candidate" | "job_seeker";
  companyId?: number | string;
  label: string;
  roleCode?: string;
}

interface MenuItem {
  key: string;
  isSelected: boolean;
  label: string;
  onClick: () => void;
}

const UserMenu = ({ anchorElUser, open, handleCloseUserMenu }: UserMenuProps) => {
  const { t, i18n } = useTranslation('common');
  const { push } = useRouter();
  const pathname = usePathname() || "/";
  const dispatch = useDispatch();
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
  const openFeedbackAfterMenuCloseRef = React.useRef(false);
  const { currentUser, activeWorkspace } = useAppSelector((state) => state.user);
  const canSubmitFeedback = !!currentUser && currentUser.roleName !== ROLES_NAME.ADMIN;
  const isAdminPortal =
    isAdminPortalPath(pathname) ||
    (typeof window !== "undefined" && window.location.hostname === HOST_NAME.ADMIN_PROJECT);
  const shouldShowAdminPortalLink =
    currentUser?.roleName === ROLES_NAME.ADMIN && !isAdminPortal;

  const workspaces = useMemo(() => (currentUser?.workspaces || []) as WorkspaceItem[], [currentUser?.workspaces]);

  const openPortal = (toEmployer = false, path = "") => {
    const normalizedPath = path ? `/${path.replace(/^\/+/, "")}` : "";
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : "";
    const targetPath = toEmployer
      ? normalizedPath || `/${ROUTES.EMPLOYER.DASHBOARD}`
      : normalizedPath;
    window.location.href = `${protocol}//${HOST_NAME.PROJECT}${port}${targetPath}`;
  };

  const openAdminPortal = () => {
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : "";
    const adminPath = buildPortalPath("admin", "/dashboard", i18n.language);
    window.location.href = `${protocol}//${HOST_NAME.PROJECT}${port}${adminPath}`;
  };

  const menuItems = React.useMemo(() => {
    const items: MenuItem[] = [];
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
          const normalizedWorkspace: Workspace = {
            type: workspace.type === "candidate" ? "job_seeker" : workspace.type,
            companyId: workspace.type === "company" ? Number(workspace.companyId || 0) : null,
            label: workspace.label,
          };
          dispatch(setActiveWorkspace(normalizedWorkspace));
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
    const accessToken = tokenService.getAccessTokenFromCookie() || '';
    const backend = tokenService.getProviderFromCookie() || '';
    (dispatch as AppDispatch)(removeUserInfo({ accessToken, backend }))
      .unwrap()
      .then(() => {
        dispatch(resetSearchJobPostFilter());
        dispatch(resetSearchCompany());
        dispatch(resetSearchResume());

        push(`/${ROUTES.AUTH.LOGIN}`);
      })
      .catch((error: AxiosError<{ errors?: ApiError }>) => {
        errorHandling(error);
      });
  };

  const handleOpenFeedback = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    openFeedbackAfterMenuCloseRef.current = true;
    handleCloseUserMenu();
  };

  const handleMenuExited = () => {
    if (!openFeedbackAfterMenuCloseRef.current) return;

    openFeedbackAfterMenuCloseRef.current = false;
    setFeedbackOpen(true);
  };

  return (
    <>
      <Menu
        anchorEl={anchorElUser}
        id="account-menu"
        open={open}
        onClose={handleCloseUserMenu}
        slotProps={{
          transition: {
            onExited: handleMenuExited,
          },
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
          {shouldShowAdminPortalLink && (
            <Button
              startIcon={<AdminPanelSettingsIcon style={{ marginLeft: 4 }} />}
              color="primary"
              variant="text"
              sx={{ textTransform: "inherit" }}
              fullWidth
              onClick={() => {
                handleCloseUserMenu();
                openAdminPortal();
              }}
            >
              <Typography marginRight="auto">{t('sidebarHeader.backToAdmin')}</Typography>
            </Button>
          )}
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
          {canSubmitFeedback && (
            <Button
              startIcon={<FeedbackOutlinedIcon style={{ marginLeft: 4 }} />}
              variant="text"
              color="primary"
              sx={{ textTransform: "inherit" }}
              fullWidth
              onClick={handleOpenFeedback}
            >
              <Typography marginRight="auto">{t('feedback.button')}</Typography>
            </Button>
          )}
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

      {canSubmitFeedback && (
        <Feedback trigger="none" open={feedbackOpen} onOpenChange={setFeedbackOpen} />
      )}
    </>
  );
};

export default UserMenu;
