import React from "react";
import { Box, Button, Divider, Skeleton, Stack, Typography, SxProps, Theme } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SettingForm from "../SettingForm";
import { useUserSettings, useUpdateUserSettings } from "../../jobSeekers/hooks/useJobSeekerQueries";
import type { FormValues as SettingformFormValues } from '../SettingForm';

interface SettingCardProps {
  title: React.ReactNode;
  sx?: SxProps<Theme>;
}

const Loading = (
  <Grid container spacing={2}>
    <Grid size={12}>
      <Box sx={{ p: 2, borderRadius: 2, bgcolor: "background.paper" }}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <Skeleton height={48} sx={{ borderRadius: 1 }} />
          </Grid>
          <Grid size={12}>
            <Skeleton height={48} sx={{ borderRadius: 1 }} />
          </Grid>
        </Grid>
      </Box>
      <Stack sx={{ mt: 4 }} direction="row" justifyContent="center">
        <Skeleton height={48} width={160} sx={{ borderRadius: 3 }} />
      </Stack>
    </Grid>
  </Grid>
);

const SettingCard = ({ title, sx }: SettingCardProps) => {
  const { data: editData, isLoading } = useUserSettings();
  const updateSettings = useUpdateUserSettings();

  const handleUpdateUserSetting = (data: SettingformFormValues) => {
    updateSettings.mutate(data);
  };

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 3,
        boxShadow: (theme) => theme.customShadows.card,
        p: 3,
        ...sx,
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
              }}
            >
              {title}
            </Typography>
          </Stack>
          <Divider sx={{ mt: 3, borderColor: "grey.500" }} />
        </Box>
        <Box>
          {isLoading ? (
            Loading
          ) : (
            <Grid container>
              <Grid size={12}>
                <Box
                  sx={{
                    p: { xs: 0, sm: 2 },
                    borderRadius: 2,
                  }}
                >
                  <SettingForm
                    editData={editData}
                    handleUpdate={handleUpdateUserSetting}
                  />
                </Box>
                <Stack sx={{ mt: 4 }} direction="row" justifyContent="center">
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveOutlinedIcon />}
                    type="submit"
                    form="setting-form"
                    sx={{
                      px: 4,
                      py: 1,
                      fontSize: "0.9rem",
                      background: (theme) => theme.palette.primary.main,
                      "&:hover": {
                        background: (theme) => theme.palette.primary.main,
                        opacity: 0.9,
                        boxShadow: (theme) => theme.customShadows.medium,
                      },
                    }}
                  >
                    Update
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default SettingCard;
