'use client';

import React from "react";
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Avatar, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useJobSeekerTotalView } from "../hooks/useJobSeekerQueries";
import { ROUTES } from "../../../../configs/constants";
import type { Theme as MaterialTheme } from '@mui/material';
import { localizeRoutePath } from "../../../../configs/routeLocalization";

const SidebarViewTotal = () => {
  const { t, i18n } = useTranslation('jobSeeker');
  const { push } = useRouter();
  const { data, isLoading } = useJobSeekerTotalView();
  const jobsHref = localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, i18n.language);

  return (
    <Box>
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {t('sidebarViewTotal.title')}
        </Typography>
        <Typography variant="caption">
          {t('sidebarViewTotal.subtitle')}
        </Typography>
      </Box>
      <Box sx={{ pt: 2 }}>
        <Stack direction="row" spacing={2}>
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: (theme: MaterialTheme) => theme.palette.primary.light,
                animation: "pulse 2s infinite",
              }}
            />
            <Avatar
              sx={{
                width: 80,
                height: 80,
                background: (theme: MaterialTheme) => theme.palette.primary.main,
                fontSize: "1.75rem",
                fontWeight: 700,
              }}
            >
              {isLoading ? (
                <CircularProgress color="secondary" />
              ) : data === null ? (
                "---"
              ) : (
                data?.totalView
              )}
            </Avatar>
          </Box>
          <Box>
            <Typography variant="body1">
              {t('sidebarViewTotal.description')}
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Stack sx={{ pt: 3 }} direction="row" justifyContent="flex-end">
        <Button
          variant="contained"
          size="medium"
          onClick={() => push(jobsHref)}
          sx={{
            background: (theme: MaterialTheme) => theme.palette.primary.main,
            px: 3,
            "&:hover": {
              background: (theme: MaterialTheme) => theme.palette.primary.main,
              opacity: 0.9,
              transform: "translateY(-1px)",
              transition: "all 0.2s",
            },
          }}
        >
          {t('sidebarViewTotal.button')}
        </Button>
      </Stack>
    </Box>
  );
};

export default SidebarViewTotal;
