'use client';

import React from "react";
import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';
import { Avatar, Box, IconButton, List, ListItem, ListItemAvatar, ListItemText, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { CV_TYPES, ROUTES } from "../../../../configs/constants";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useResumes } from "../hooks/useJobSeekerQueries";
import { Theme } from "@mui/material/styles";
import { Resume } from "../../../../types/models";

interface JobApplicationExt extends Omit<Resume, 'type'> {
  isActive?: boolean;
  type?: number | string;
  updateAt?: string;
}

const JobApplicationCard = () => {
  const { t } = useTranslation(['jobSeeker', 'common']);
  const { push } = useRouter();
  const { currentUser } = useAppSelector((state) => state.user);
  
  const profileId = currentUser?.jobSeekerProfile?.id || currentUser?.jobSeekerProfileId;

  const { data, isLoading } = useResumes(profileId ? String(profileId) : undefined);

  return (
    <Box
      sx={{
        background: "#fff",
        borderRadius: 2,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t('jobSeeker:jobApplication.title')}
        </Typography>
        <IconButton
          aria-label={t('jobSeeker:jobApplication.aria.navigateToProfile')}
          size="medium"
          onClick={() =>
            push(`/${ROUTES.JOB_SEEKER.PROFILE}`)
          }
          sx={{
            "&:hover": {
              backgroundColor: (theme: Theme) => theme.palette.primary.light,
              color: (theme: Theme) => theme.palette.primary.main,
            },
          }}
        >
          <ArrowForwardIcon />
        </IconButton>
      </Stack>
      <Box>
        {isLoading ? (
          <Stack spacing={1}>
            {['application-skeleton-1', 'application-skeleton-2', 'application-skeleton-3'].map((key) => (
              <Skeleton key={key} variant="rounded" height={72} />
            ))}
          </Stack>
        ) : (
          <List disablePadding>
            {((data as JobApplicationExt[]) || []).map((item: JobApplicationExt) => (
              <ListItem
                key={item?.id || item?.title}
                sx={{
                  p: 2,
                  mb: 1,
                  background: (theme: Theme) => theme.palette.grey[50],
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: (theme: Theme) => theme.shadows[2],
                  },
                }}
              >
                <ListItemAvatar>
                  {item?.type === CV_TYPES.cvWebsite ? (
                    <Tooltip title={t('jobSeeker:jobApplication.onlineProfile')}>
                      <Avatar
                        sx={{
                          bgcolor: (theme: Theme) => theme.palette.primary.main,
                          width: 45,
                          height: 45,
                        }}
                      >
                        <DescriptionOutlinedIcon />
                      </Avatar>
                    </Tooltip>
                  ) : item?.type === CV_TYPES.cvUpload ? (
                    <Tooltip title={t('jobSeeker:jobApplication.attachedResume')}>
                      <Avatar
                        sx={{
                          bgcolor: (theme: Theme) => theme.palette.error.main,
                          width: 45,
                          height: 45,
                        }}
                      >
                        <PictureAsPdfOutlinedIcon />
                      </Avatar>
                    </Tooltip>
                  ) : (
                    <Avatar sx={{ width: 45, height: 45 }}>-</Avatar>
                  )}
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {item?.title}
                    </Typography>
                  }
                  secondary={
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        {t('common:lastModified')} {dayjs(item?.updateAt).format("DD/MM/YYYY")}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: item?.isActive
                            ? (theme: Theme) => theme.palette.success.main
                            : (theme: Theme) => theme.palette.error.main,
                          fontWeight: 500,
                        }}
                      >
                        {item?.isActive
                          ? t('common:status.searchable')
                          : t('common:status.notSearchable')}
                      </Typography>
                    </Stack>
                  }
                  slotProps={{ secondary: { component: "div" } }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default JobApplicationCard;
