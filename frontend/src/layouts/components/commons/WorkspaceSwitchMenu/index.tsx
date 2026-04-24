import React from "react";
import { useAppSelector } from '@/redux/hooks';
import { useDispatch } from "react-redux";
import { Box, Button, Menu, MenuItem, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { HOST_NAME, ROUTES } from "../../../../configs/constants";
import { setActiveWorkspace } from "../../../../redux/userSlice";

type WorkspaceItem = {
  type: "company" | "job_seeker";
  companyId?: number | null;
  label?: string;
};

const WorkspaceSwitchMenu = () => {
  const dispatch = useDispatch();
  const { currentUser, activeWorkspace } = useAppSelector((state) => state.user);
  const workspaces = React.useMemo(() => (currentUser?.workspaces as WorkspaceItem[]) || [], [currentUser?.workspaces]);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const currentWorkspace = React.useMemo(() => {
    if (!activeWorkspace) return null;
    return workspaces.find((w: WorkspaceItem) => {
      if (w.type !== activeWorkspace.type) return false;
      if (w.type === "company") return Number(w.companyId) === Number(activeWorkspace.companyId);
      return true;
    }) || null;
  }, [workspaces, activeWorkspace]);

  if (workspaces.length <= 1) return null;

  const openPortal = (toEmployer = false, path = "") => {
    const normalizedPath = path ? `/${path.replace(/^\/+/, "")}` : "";
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : "";
    const mainHost = HOST_NAME.PROJECT;
    const targetUrl = toEmployer
      ? `${protocol}//${mainHost}${port}${normalizedPath || `/${ROUTES.EMPLOYER.DASHBOARD}`}`
      : `${protocol}//${mainHost}${port}${normalizedPath}`;
    window.location.href = targetUrl;
  };

  const handleSelectWorkspace = (workspace: WorkspaceItem) => {
    dispatch(setActiveWorkspace(workspace));
    setAnchorEl(null);
    if (workspace.type === "company") {
      openPortal(true, ROUTES.EMPLOYER.DASHBOARD);
      return;
    }
    openPortal(false, ROUTES.JOB_SEEKER.DASHBOARD);
  };

  return (
    <Box sx={{ mr: 1 }}>
      <Button
        color="inherit"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{
          textTransform: "none",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: 2,
          px: 1.5,
          minWidth: 150,
        }}
      >
        <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
          {currentWorkspace?.label || "Workspace"}
        </Typography>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {workspaces.map((workspace) => (
          <MenuItem
            key={`${workspace.type}-${workspace.companyId || "candidate"}`}
            selected={
              workspace.type === activeWorkspace?.type &&
              (workspace.type !== "company" ||
                Number(workspace.companyId) === Number(activeWorkspace?.companyId))
            }
            onClick={() => handleSelectWorkspace(workspace)}
          >
            {workspace.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default WorkspaceSwitchMenu;

