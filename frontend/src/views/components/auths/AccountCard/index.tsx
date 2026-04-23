import React from "react";
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { Box, Button, Divider, Stack, Typography, SxProps, Theme } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { Grid2 as Grid } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { ROUTES } from "../../../../configs/constants";
import toastMessages from "../../../../utils/toastMessages";
import errorHandling from "../../../../utils/errorHandling";
import BackdropLoading from "../../../../components/Common/Loading/BackdropLoading";
import FormPopup from "../../../../components/Common/Controls/FormPopup";
import AccountForm from "../AccountForm";
import UpdatePasswordForm, { UpdatePasswordFormData } from "../UpdatePasswordForm";
import { updateUserInfo, removeUserInfo } from "../../../../redux/userSlice";
import authService from "../../../../services/authService";
import tokenService from "../../../../services/tokenService";
import AvatarCard from "../AvatarCard";
import { useAppDispatch } from "../../../../redux/hooks";

interface AccountCardProps {
  title: React.ReactNode;
  sx?: SxProps<Theme>;
}

const AccountCard = ({ title, sx }: AccountCardProps) => {

  const { t } = useTranslation('auth');

  const dispatch = useAppDispatch();

  const nav = useRouter();

  const [openPopup, setOpenPopup] = React.useState(false);

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  const [serverErrors, setServerErrors] = React.useState<Record<string, string[]> | null>(null);

  const handleUpdateAccount = (data: { fullName: string }) => {
    const payload = {
      fullName: data.fullName,
    };

    dispatch(updateUserInfo(payload))
      .unwrap()
      .then(() =>
        toastMessages.success(t('account.updateSuccess'))
      )
      .catch((error: unknown) => {
        errorHandling(error, (errs) => setServerErrors(errs as Record<string, string[]>));
      });
  };

  const handleUpdatePassword = (data: UpdatePasswordFormData) => {
    const update = async (data: UpdatePasswordFormData) => {
      setIsFullScreenLoading(true);
      try {
        await authService.changePassword(data);
        setOpenPopup(false);
        toastMessages.success(t('account.passwordChangeSuccess'));
        let path = ROUTES.AUTH.LOGIN;
        const accessToken = tokenService.getAccessTokenFromCookie() as string;
        const backend = tokenService.getProviderFromCookie() as string | undefined;
        dispatch(removeUserInfo({ accessToken, backend }))
          .unwrap()
          .then(() => {
            nav.push(path);
          })
          .catch((err: unknown) => {
            toastMessages.error(t('messages.genericError'));
          });
      } catch (error: unknown) {
        errorHandling(error, (errs) => setServerErrors(errs as Record<string, string[]>));
      } finally {
        setIsFullScreenLoading(false);
      }
    };
    update(data);
  };

  return (

    <>

      <Box

        sx={{

          background: "#fff",

          borderRadius: 3,

          boxShadow: (theme: Theme) => theme.customShadows?.card,

          p: 3,

          ...sx

        }}

      >

        <Stack spacing={3}>

          <Box>

            <Stack

              direction="row"

              justifyContent="space-between"

              alignItems="center"

            >

              <Typography variant="h5" sx={{ fontWeight: 600 }}>

                {title}

              </Typography>

            </Stack>

          </Box>

          <Divider sx={{ my: 0, borderColor: "grey.500" }} />

          <Box sx={{ px: { xs: 0, sm: 2 } }}>

            <Grid container spacing={4}>

              <Grid size={12}>

                <AvatarCard />

              </Grid>

              <Grid size={12}>

                <Box>
                  <AccountForm 
                    handleUpdate={handleUpdateAccount} 
                    serverErrors={serverErrors}
                  />
                </Box>

                <Box>

                  <Typography

                    sx={{

                      color: "primary.main",

                      mt: 2,

                      textAlign: "right",

                      "&:hover": {

                        color: "primary.dark",

                        textDecoration: "underline",

                      },

                    }}

                    variant="subtitle2"

                  >

                    <button
                      type="button"
                      onClick={() => setOpenPopup(true)}
                      style={{
                        cursor: 'pointer',
                        background: 'transparent',
                        border: 0,
                        padding: 0,
                        color: 'inherit',
                        font: 'inherit',
                      }}
                    >
                      {t('account.changePassword')}
                    </button>

                  </Typography>

                </Box>

                <Stack sx={{ mt: 4 }} direction="row" justifyContent="center">

                  <Button

                    variant="contained"

                    color="primary"

                    startIcon={<SaveOutlinedIcon />}

                    type="submit"

                    form="account-form"

                    sx={{

                      px: 4,

                      py: 1,

                      fontSize: "0.9rem",

                      background: (theme: Theme) => theme.palette.primary.main,

                      "&:hover": {

                        background: (theme: Theme) => theme.palette.primary.main,

                        opacity: 0.9,

                        boxShadow: (theme: Theme) => theme.customShadows?.medium,

                      },

                    }}

                  >

                    {t('account.update')}

                  </Button>

                </Stack>

              </Grid>

            </Grid>

          </Box>

        </Stack>

      </Box>

      <FormPopup

        title={t('account.updatePassword')}

        openPopup={openPopup}

        setOpenPopup={setOpenPopup}

      >

        <UpdatePasswordForm

          handleUpdatePassword={handleUpdatePassword}

          serverErrors={serverErrors ?? {}}

        />

      </FormPopup>

      {isFullScreenLoading && <BackdropLoading />}

    </>

  );

};

export default AccountCard;

