import * as React from "react";
import { Avatar, Box, Button, Card, Stack, Typography } from "@mui/material";
import UserMenu from "../UserMenu";

type HeaderAuthAreaProps = {
  isAuthenticated: boolean;
  currentUserName?: string;
  currentUserAvatarUrl?: string | null;
  anchorElUser: HTMLElement | null;
  onOpenUserMenu: (event: React.MouseEvent<HTMLElement>) => void;
  onCloseUserMenu: () => void;
  onLogin: () => void;
  onSignUp: () => void;
};

const HeaderAuthArea = ({
  isAuthenticated,
  currentUserName,
  currentUserAvatarUrl,
  anchorElUser,
  onOpenUserMenu,
  onCloseUserMenu,
  onLogin,
  onSignUp,
}: HeaderAuthAreaProps) => {
  return isAuthenticated ? (
    <Box sx={{ flexGrow: 0, ml: 1 }}>
      <Card
        variant="outlined"
        onClick={onOpenUserMenu}
        role="button"
        tabIndex={0}
        onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpenUserMenu(e as unknown as React.MouseEvent<HTMLElement>);
          }
        }}
        sx={{
          p: 0.5,
          borderRadius: 50,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderColor: "rgba(255, 255, 255, 0.4)",
          cursor: "pointer",
          transition: "all 0.3s ease",
          backdropFilter: "blur(8px)",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderColor: "rgba(255, 255, 255, 0.6)",
            transform: "translateY(-1px)",
          },
        }}
      >
        <Stack direction="row" justifyContent="center" alignItems="center">
          <Avatar
            alt="User Avatar"
            src={currentUserAvatarUrl ?? undefined}
            sx={{
              width: 36,
              height: 36,
              border: "2px solid rgba(255, 255, 255, 0.6)",
            }}
          />
          <Typography
            variant="subtitle2"
            sx={{
              px: 1,
              color: "white",
              fontWeight: 600,
              display: {
                xs: "none",
                sm: "block",
              },
            }}
          >
            {currentUserName}
          </Typography>
        </Stack>
      </Card>

      <UserMenu
        anchorElUser={anchorElUser}
        open={Boolean(anchorElUser)}
        handleCloseUserMenu={onCloseUserMenu}
      />
    </Box>
  ) : (
    <Box sx={{ ml: 1, display: "block" }}>
      <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          sx={{
            color: "white",
            borderColor: "rgba(255, 255, 255, 0.5)",
            borderRadius: "24px",
            px: { xs: 1.5, sm: 2.5 },
            py: 0.75,
            fontSize: { xs: "0.75rem", sm: "0.85rem" },
            fontWeight: 600,
            textTransform: "none",
            backdropFilter: "blur(4px)",
            transition: "all 0.3s ease",
            "&:hover": {
              borderColor: "white",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              transform: "translateY(-1px)",
            },
          }}
          onClick={onLogin}
        >
          Login
        </Button>

        <Button
          variant="contained"
          sx={{
            color: "primary.main",
            backgroundColor: "white",
            borderRadius: "24px",
            px: { xs: 1.5, sm: 2.5 },
            py: 0.75,
            fontSize: { xs: "0.72rem", sm: "0.85rem" },
            fontWeight: 600,
            textTransform: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            },
          }}
          onClick={onSignUp}
        >
          Register
        </Button>
      </Stack>
    </Box>
  );
};

export default HeaderAuthArea;

