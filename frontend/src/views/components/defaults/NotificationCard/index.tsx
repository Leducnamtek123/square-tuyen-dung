'use client';
import React from "react";
import { useRouter } from 'next/navigation';
import { Box, Button, CircularProgress, Divider, IconButton, Stack, Typography } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import { IMAGES } from "../../../../configs/constants";
import MuiImageCustom from "../../../../components/Common/MuiImageCustom";
import NoDataCard from "../../../../components/Common/NoDataCard";
import TimeAgo from "../../../../components/Common/TimeAgo";
import { useNotifications } from "../../../../hooks/useNotifications";
import { useAppSelector } from "../../../../hooks/useAppStore";
import { useTranslation } from 'react-i18next';
import { getNotificationTargetPath, isExternalNotificationTarget } from "../../../../utils/notificationRouting";
import type { AppNotification } from "../../../../hooks/useNotifications";

interface NotificationCardProps {
  title: React.ReactNode;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ title }) => {
  const { push } = useRouter();
  const { t, i18n } = useTranslation('common');
  const { currentUser } = useAppSelector((state) => state.user);
  const {
    isLoading,
    unreadCount,
    notifications,
    loadMore,
    hasMore,
    handleRead,
    handleRemove,
    handleMakeAllRead,
    handleRemoveAll
  } = useNotifications();

  const getNotificationTone = (item: AppNotification) => {
    const type = String(item?.type || '').toUpperCase();
    const isRead = Boolean(item?.is_read);

    let categoryIcon = NotificationsActiveIcon;
    let categoryAccent = '#2563eb';

    if (type.includes('NEW_MESSAGE')) {
      categoryIcon = ChatBubbleOutlineIcon;
      categoryAccent = '#2563eb';
    } else if (type.includes('APPLY_JOB')) {
      categoryIcon = WorkOutlineIcon;
      categoryAccent = '#ea580c';
    } else if (type.includes('POST_VERIFY_REQUIRED')) {
      categoryIcon = VerifiedOutlinedIcon;
      categoryAccent = '#2563eb';
    }

    if (isRead) {
      return {
        icon: categoryIcon,
        accent: '#334155',
        softBg: '#ffffff',
        border: 'rgba(226, 232, 240, 0.8)',
        badgeBg: '#94a3b8',
        tagBg: '#f1f5f9',
        tagColor: '#64748b',
        label: t('notification.read'),
        isRead: true,
      };
    }

    return {
      icon: categoryIcon,
      accent: categoryAccent,
      softBg: 'rgba(37, 99, 235, 0.04)',
      border: 'rgba(37, 99, 235, 0.16)',
      badgeBg: categoryAccent,
      tagBg: 'rgba(37, 99, 235, 0.1)',
      tagColor: '#2563eb',
      label: t('notification.new'),
      isRead: false,
    };
  };

  const handleClickItem = async (item: typeof notifications[0]) => {
    await handleRead(item.key);

    const targetPath = getNotificationTargetPath(item, currentUser?.roleName, i18n.language);
    if (targetPath) {
      if (isExternalNotificationTarget(targetPath)) {
        window.location.assign(targetPath);
      } else {
        push(targetPath);
      }
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
          {unreadCount > 0 && (
            <Typography variant="body2" color="text.secondary">
              {t('notification.unreadCount', { count: unreadCount })}
            </Typography>
          )}
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
                  onClick={() => void handleMakeAllRead()}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {t('notification.markAllRead')}
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
                  onClick={() => void handleRemoveAll()}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {t('clearAll')}
                  </Typography>
                </Button>
              </>
            )}
          </Stack>
        </Stack>
        <Divider />
        <Stack spacing={2}>
          {notifications.length === 0 && !isLoading && (
            <NoDataCard title={t('notification.empty')} />
          )}

          {notifications.map((value) => (
            (() => {
              const tone = getNotificationTone(value);
              const ToneIcon = tone.icon;
              return (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 2, sm: 2.5 }}
                  alignItems={{ xs: "stretch", sm: "flex-start" }}
                  key={value.key}
                  sx={{
                    p: { xs: 2, sm: 2.25 },
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: tone.border,
                    backgroundColor: tone.softBg,
                    position: "relative",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 6px 20px rgba(15, 23, 42, 0.08)",
                      borderColor: tone.isRead ? '#cbd5e1' : 'rgba(37, 99, 235, 0.3)',
                    },
                  }}
                >
                  <Box
                    sx={{ cursor: "pointer", display: "flex", justifyContent: { xs: "center", sm: "flex-start" }, flexShrink: 0 }}
                    onClick={() => handleClickItem(value)}
                  >
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: tone.border,
                        bgcolor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                      }}
                    >
                      <MuiImageCustom
                        width={58}
                        height={58}
                        src={value?.image || value?.imageUrl || IMAGES.notificationImageDefault}
                        sx={{ p: 0.6, borderRadius: 2, objectFit: 'contain' }}
                        duration={500}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: -4,
                          right: -4,
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          bgcolor: tone.badgeBg,
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                        }}
                      >
                        <ToneIcon sx={{ fontSize: 12 }} />
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ cursor: "pointer", flex: 1, pr: { sm: 4 } }} onClick={() => handleClickItem(value)}>
                    <Stack spacing={0.75}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {!tone.isRead && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: '#2563eb',
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: tone.isRead ? 500 : 700,
                            color: tone.isRead ? 'text.primary' : '#0f172a',
                            lineHeight: 1.35,
                          }}
                        >
                          {value.title}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.875rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                      >
                        {value.content}
                      </Typography>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 500 }}>
                          <TimeAgo date={(value?.time?.seconds || 0) * 1000} type="fromNow" />
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            px: 1,
                            py: 0.25,
                            backgroundColor: tone.tagBg,
                            color: tone.tagColor,
                            borderRadius: 1,
                            fontSize: '0.725rem',
                            fontWeight: 600,
                          }}
                        >
                          {tone.label}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                  <Box sx={{ position: "absolute", top: 12, right: 12 }}>
                    <IconButton
                      aria-label={t('actions.delete')}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(value.key);
                      }}
                      sx={{
                        color: 'text.disabled',
                        p: 0.5,
                        transition: 'all 0.2s',
                        "&:hover": {
                          color: "error.main",
                          backgroundColor: "rgba(239, 68, 68, 0.08)",
                        },
                      }}
                    >
                      <ClearIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Stack>
              );
            })()
          ))}
          {isLoading && (
            <Stack direction="row" justifyContent="center">
              <CircularProgress />
            </Stack>
          )}
          {hasMore && (
            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
              <Button onClick={loadMore} variant="contained" disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : t('notification.loadMore')}
              </Button>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default NotificationCard;
