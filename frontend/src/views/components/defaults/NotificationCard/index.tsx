import React from "react";
import { useRouter } from 'next/navigation';
import { Box, Button, CircularProgress, Divider, IconButton, Stack, Typography } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { IMAGES, ROUTES } from "../../../../configs/constants";
import MuiImageCustom from "../../../../components/Common/MuiImageCustom";
import NoDataCard from "../../../../components/Common/NoDataCard";
import TimeAgo from "../../../../components/Common/TimeAgo";
import { formatRoute } from "../../../../utils/funcUtils";
import { useNotifications } from "../../../../hooks/useNotifications";

interface NotificationCardProps {
  title: React.ReactNode;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ title }) => {
  const nav = useRouter();
  const {
    isLoading,
    notifications,
    loadMore,
    hasMore,
    handleRead,
    handleRemove,
    handleMakeAllRead,
    handleRemoveAll
  } = useNotifications();

  const handleClickItem = (item: any) => {
    switch (item.type) {
      case "SYSTEM":
        handleRead(item.key);
        nav.push("/");
        break;
      case "EMPLOYER_VIEWED_RESUME":
      case "EMPLOYER_SAVED_RESUME":
        handleRead(item.key);
        nav.push(`/${ROUTES.JOB_SEEKER.MY_COMPANY}`);
        break;
      case "APPLY_STATUS":
        handleRead(item.key);
        nav.push(`/${ROUTES.JOB_SEEKER.MY_JOB}`);
        break;
      case "COMPANY_FOLLOWED":
        handleRead(item.key);
        nav.push(`/${ROUTES.EMPLOYER.PROFILE}`);
        break;
      case "POST_VERIFY_RESULT":
        handleRead(item.key);
        nav.push(`/${ROUTES.EMPLOYER.JOB_POST}`);
        break;
      case "APPLY_JOB":
        handleRead(item.key);
        nav.push(`/${formatRoute(ROUTES.EMPLOYER.PROFILE_DETAIL, item["APPLY_JOB"]?.resume_slug)}`);
        break;
      default:
        break;
    }
  };

  return (
    <Box>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
            {title}
          </Typography>
          <Stack direction="row" spacing={1}>
            {notifications.length > 0 && (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CheckCircleOutlineIcon />}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    "&:hover": { backgroundColor: "action.hover" },
                  }}
                  onClick={handleMakeAllRead}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Đánh dấu tất cả là đã đọc
                  </Typography>
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteOutlineIcon />}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    "&:hover": { backgroundColor: "error.light", color: "white" },
                  }}
                  onClick={handleRemoveAll}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Xóa tất cả
                  </Typography>
                </Button>
              </>
            )}
          </Stack>
        </Stack>
        <Divider />
        <Stack spacing={2}>
          {notifications.length === 0 && !isLoading && (
            <NoDataCard title="Chưa có thông báo nào!" />
          )}

          {notifications.map((value, idx) => (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 2, sm: 3 }}
              alignItems={{ xs: "stretch", sm: "center" }}
              key={idx}
              sx={{
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                border: "1px solid",
                borderColor: value?.is_read === true ? "divider" : "error.light",
                backgroundColor: value?.is_read === true ? "transparent" : "error.50",
                position: "relative",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                sx={{ cursor: "pointer", display: "flex", justifyContent: { xs: "center", sm: "flex-start" } }}
                onClick={() => handleClickItem(value)}
              >
                <MuiImageCustom
                  width={80}
                  height={80}
                  src={value?.image || IMAGES.notificationImageDefault}
                  sx={{ p: 0.5, borderRadius: 2, border: 1, borderColor: "divider" }}
                  duration={500}
                />
              </Box>
              <Box sx={{ cursor: "pointer", flex: 1 }} onClick={() => handleClickItem(value)}>
                <Stack spacing={1}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: value?.is_read === true ? 500 : 700,
                      color: value?.is_read === true ? "text.secondary" : "text.primary",
                      lineHeight: 1.3,
                    }}
                  >
                    {value.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.95rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                  >
                    {value.content}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 500 }}>
                      <TimeAgo date={value?.time?.seconds * 1000} type="fromNow" />
                    </Typography>
                    {!value?.is_read && (
                      <Box sx={{ px: 1, py: 0.25, backgroundColor: "error.main", color: "white", borderRadius: 1, fontSize: "0.7rem", fontWeight: "bold" }}>
                        MỚI
                      </Box>
                    )}
                  </Stack>
                </Stack>
              </Box>
              <Box sx={{ position: { xs: "absolute", sm: "relative" }, top: { xs: 8, sm: "auto" }, right: { xs: 8, sm: "auto" } }}>
                <IconButton aria-label="delete" color="error" onClick={() => handleRemove(value.key)} sx={{ "&:hover": { backgroundColor: "error.light", color: "white" } }}>
                  <ClearIcon />
                </IconButton>
              </Box>
            </Stack>
          ))}
          {isLoading && (
            <Stack direction="row" justifyContent="center">
              <CircularProgress />
            </Stack>
          )}
          {hasMore && (
            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
              <Button onClick={loadMore} variant="contained" disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : "Tải thêm"}
              </Button>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default NotificationCard;
