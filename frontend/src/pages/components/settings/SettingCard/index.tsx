import React from "react";
import { Box, Button, Divider, Skeleton, Stack, Typography, SxProps, Theme } from "@mui/material";
import Grid from "@mui/material/Grid2";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SettingForm from "../SettingForm";
import authService from "../../../../services/authService";
import toastMessages from "../../../../utils/toastMessages";
import { useAppSelector } from "../../../../redux/hooks";

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

  const { currentUser } = useAppSelector((state) => state.user);

  const [isLoadingSettings, setIsLoadingSettings] = React.useState(true);

  const [editData, setEditData] = React.useState(null);

  React.useEffect(() => {

    const loadCertificates = async () => {
      setIsLoadingSettings(true);
      try {
        const resData = await authService.getUserSettings() as any;
        setEditData(resData.data);
      } catch (error) {
      } finally {
        setIsLoadingSettings(false);
      }
    };
    loadCertificates();
  }, [currentUser]);

  const handleUpdateUserSetting = (data: any) => {
    const updateSetting = async (data: any) => {
      try {
        const resData = await authService.updateUserSettings(data) as any;
        setEditData(resData.data);
        toastMessages.success("Settings updated successfully.");
      } catch (error) {
        toastMessages.error("Failed to update settings.");
      }
    };
    updateSetting(data);
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

          {isLoadingSettings ? (

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

                      background: (theme) => theme.palette.primary.gradient,

                      "&:hover": {

                        background: (theme) => theme.palette.primary.gradient,

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
