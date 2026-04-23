import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Box, Divider, Fab, Skeleton, Stack, Typography, SxProps, Theme } from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

import NoDataCard from '../../../../components/Common/NoDataCard';
import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import FormPopup from '../../../../components/Common/Controls/FormPopup';
import PersonalProfileForm, { PersonalProfileFormValues } from '../PersonalProfileForm';
import jobSeekerProfileService from '../../../../services/jobSeekerProfileService';
import { getUserInfo } from '../../../../redux/userSlice';
import { useAppDispatch } from '../../../../redux/hooks';
import { tConfig } from '../../../../utils/tConfig';
import { useConfig } from '@/hooks/useConfig';
import type { JobSeekerProfile, Location } from '../../../../types/models';
import type { JobSeekerProfileUpdatePayload } from '../../../../services/jobSeekerProfileService';

type EnhancedJobSeekerProfile = JobSeekerProfile & {
  user?: { fullName: string };
  location?: Location & { districtDict?: { name: string } };
  idCardNumber?: string;
  idCardIssueDate?: Date | string | null;
  idCardIssuePlace?: string;
  taxCode?: string;
  socialInsuranceNo?: string;
  permanentAddress?: string;
  contactAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
};

interface PersonalInfoCardProps {
  title: string;
  sx?: SxProps<Theme>;
}

type UiState = {
  openPopup: boolean;
  isLoadingProfile: boolean;
  isFullScreenLoading: boolean;
  refreshToken: number;
};

type UiAction =
  | { type: 'open_popup' }
  | { type: 'close_popup' }
  | { type: 'set_loading_profile'; payload: boolean }
  | { type: 'set_full_screen_loading'; payload: boolean }
  | { type: 'refresh' };

const initialUiState: UiState = {
  openPopup: false,
  isLoadingProfile: true,
  isFullScreenLoading: false,
  refreshToken: 0,
};

const reducer = (state: UiState, action: UiAction): UiState => {
  switch (action.type) {
    case 'open_popup':
      return { ...state, openPopup: true };
    case 'close_popup':
      return { ...state, openPopup: false };
    case 'set_loading_profile':
      return { ...state, isLoadingProfile: action.payload };
    case 'set_full_screen_loading':
      return { ...state, isFullScreenLoading: action.payload };
    case 'refresh':
      return { ...state, refreshToken: state.refreshToken + 1 };
    default:
      return state;
  }
};

const Loading = (
  <Box>
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
      <Typography variant="h6" flex={1}>
        <Skeleton />
      </Typography>
      <Box>
        <Skeleton variant="circular" width={50} height={50} />
      </Box>
    </Stack>
  </Box>
);

const PersonalInfoField = ({ title, value, fallback }: { title: React.ReactNode; value: React.ReactNode; fallback: string }) => (
  <Box
    sx={{
      p: 1,
      backgroundColor: 'background.paper',
    }}
  >
    <Typography
      sx={{
        fontWeight: 600,
        color: 'primary.main',
        fontSize: '0.875rem',
        mb: 1,
      }}
    >
      {title}
    </Typography>
    <Typography
      sx={{
        color: value ? 'text.primary' : 'text.disabled',
        fontStyle: value ? 'normal' : 'italic',
        fontSize: value ? '1rem' : '0.875rem',
      }}
    >
      {value || fallback}
    </Typography>
  </Box>
);

const PersonalInfoCard = ({ title, sx }: PersonalInfoCardProps) => {
  const { t } = useTranslation(['jobSeeker', 'common']);
  const dispatchApp = useAppDispatch();
  const { allConfig } = useConfig();

  const [uiState, dispatch] = React.useReducer(reducer, initialUiState);
  const [profile, setProfile] = React.useState<EnhancedJobSeekerProfile | null>(null);

  React.useEffect(() => {
    const getProfile = async () => {
      dispatch({ type: 'set_loading_profile', payload: true });
      try {
        const resData = await jobSeekerProfileService.getProfile();
        setProfile(resData as EnhancedJobSeekerProfile);
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        dispatch({ type: 'set_loading_profile', payload: false });
      }
    };

    getProfile();
  }, [uiState.refreshToken]);

  const handleUpdateProfile = async (data: PersonalProfileFormValues) => {
    dispatch({ type: 'set_full_screen_loading', payload: true });
    try {
      await jobSeekerProfileService.updateProfile(data as JobSeekerProfileUpdatePayload);
      dispatchApp(getUserInfo());
      dispatch({ type: 'refresh' });
      dispatch({ type: 'close_popup' });
      toastMessages.success(t('jobSeeker:profile.messages.personalUpdateSuccess'));
    } catch (error: unknown) {
      errorHandling(error);
    } finally {
      dispatch({ type: 'set_full_screen_loading', payload: false });
    }
  };

  const editData = React.useMemo(
    () =>
      profile
        ? {
            user: {
              fullName: profile.user?.fullName || '',
            },
            phone: profile.phone || '',
            birthday: profile.birthday || null,
            gender: profile.gender || '',
            maritalStatus: profile.maritalStatus || '',
            location: {
              city: typeof profile.location?.city === 'object' ? profile.location.city.id : (profile.location?.city || ''),
              district: typeof profile.location?.district === 'object' ? profile.location.district.id : (profile.location?.district || ''),
              address: profile.location?.address || '',
            },
            idCardNumber: profile.idCardNumber || '',
            idCardIssueDate: profile.idCardIssueDate
              ? typeof profile.idCardIssueDate === 'string'
                ? new Date(profile.idCardIssueDate)
                : profile.idCardIssueDate
              : null,
            idCardIssuePlace: profile.idCardIssuePlace || '',
            taxCode: profile.taxCode || '',
            socialInsuranceNo: profile.socialInsuranceNo || '',
            permanentAddress: profile.permanentAddress || '',
            contactAddress: profile.contactAddress || '',
            emergencyContactName: profile.emergencyContactName || '',
            emergencyContactPhone: profile.emergencyContactPhone || '',
          }
        : null,
    [profile],
  );

  return (
    <>
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 3,
          p: 3,
          boxShadow: (theme) => theme.customShadows.card,
          ...sx,
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
              {profile && (
                <Fab
                  size="small"
                  color="secondary"
                  aria-label={t('common:actions.edit')}
                  onClick={() => dispatch({ type: 'open_popup' })}
                  sx={{
                    boxShadow: (theme) => theme.customShadows.medium,
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <EditIcon />
                </Fab>
              )}
            </Stack>
          </Box>

          <Divider sx={{ my: 0, borderColor: 'grey.500' }} />

          {uiState.isLoadingProfile ? (
            Loading
          ) : profile === null ? (
            <NoDataCard />
          ) : (
            <Stack sx={{ px: 1 }}>
              <Grid container spacing={2}>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                    lg: 4,
                    xl: 4,
                  }}
                >
                  <Stack spacing={1.5}>
                    <PersonalInfoField
                      title={t('jobSeeker:profile.fields.fullName')}
                      value={profile?.user?.fullName}
                      fallback={t('common:noData')}
                    />
                    <PersonalInfoField
                      title={t('jobSeeker:profile.fields.phone')}
                      value={profile?.phone}
                      fallback={t('common:noData')}
                    />
                    <PersonalInfoField
                      title={t('jobSeeker:profile.fields.gender')}
                      value={tConfig(allConfig?.genderDict?.[profile?.gender as keyof typeof allConfig.genderDict])}
                      fallback={t('common:noData')}
                    />
                    <PersonalInfoField
                      title={t('jobSeeker:profile.fields.birthday')}
                      value={profile?.birthday ? dayjs(profile.birthday).format('DD/MM/YYYY') : profile?.birthday}
                      fallback={t('common:noData')}
                    />
                    <PersonalInfoField
                      title={t('jobSeeker:profile.fields.maritalStatus')}
                      value={tConfig(allConfig?.maritalStatusDict?.[profile?.maritalStatus as keyof typeof allConfig.maritalStatusDict])}
                      fallback={t('common:noData')}
                    />
                  </Stack>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 8,
                    lg: 8,
                    xl: 8,
                  }}
                >
                  <Stack spacing={1.5}>
                    <PersonalInfoField
                      title={t('common:city')}
                      value={tConfig(allConfig?.cityDict?.[String(profile?.location?.city)])}
                      fallback={t('common:noData')}
                    />
                    <PersonalInfoField
                      title={t('jobSeeker:profile.fields.district')}
                      value={profile?.location?.districtDict?.name}
                      fallback={t('common:noData')}
                    />
                    <PersonalInfoField
                      title={t('jobSeeker:profile.fields.address')}
                      value={profile?.location?.address}
                      fallback={t('common:noData')}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          )}
        </Stack>
      </Box>

      <FormPopup
        title={t('jobSeeker:profile.sections.personal')}
        openPopup={uiState.openPopup}
        setOpenPopup={(open) => dispatch({ type: open ? 'open_popup' : 'close_popup' })}
      >
        <PersonalProfileForm handleUpdateProfile={handleUpdateProfile} editData={editData} />
      </FormPopup>

      {uiState.isFullScreenLoading && <BackdropLoading />}
    </>
  );
};

export default PersonalInfoCard;
