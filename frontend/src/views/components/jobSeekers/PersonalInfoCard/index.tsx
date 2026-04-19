import React from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Box, Divider, Fab, Skeleton, Stack, Typography, SxProps, Theme } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import NoDataCard from "../../../../components/Common/NoDataCard";
import toastMessages from "../../../../utils/toastMessages";
import errorHandling from "../../../../utils/errorHandling";
import BackdropLoading from "../../../../components/Common/Loading/BackdropLoading";
import FormPopup from "../../../../components/Common/Controls/FormPopup";
import PersonalProfileForm, { PersonalProfileFormValues } from "../PersonalProfileForm";
import jobSeekerProfileService from "../../../../services/jobSeekerProfileService";
import { getUserInfo } from "../../../../redux/userSlice";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { tConfig } from '../../../../utils/tConfig';
import { useConfig } from '@/hooks/useConfig';
import { JobSeekerProfile, Location } from '../../../../types/models';
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
// Skip Loading definition for brevity in this replace call, 
// but ensure it's still there or replaced correctly. 
// I'll replace from line 1 to 126.
// Re-including Loading for completeness.

const Loading = (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Typography variant="h6" flex={1}>
          <Skeleton />
        </Typography>
        <Box>
          <Skeleton variant="circular" width={50} height={50} />
        </Box>
      </Stack>
    </Box>
);

const PersonalInfoCard = ({ title, sx }: PersonalInfoCardProps) => {

    const { t } = useTranslation(['jobSeeker', 'common']);

    const dispatch = useAppDispatch();
    const { allConfig } = useConfig();

    const [openPopup, setOpenPopup] = React.useState(false);

    const [isSuccess, setIsSuccess] = React.useState(false);

    const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);

    const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

    const [profile, setProfile] = React.useState<EnhancedJobSeekerProfile | null>(null);

    const item = (title: React.ReactNode, value: React.ReactNode) => {

        return (

            <Box

                sx={{

                    p: 1,

                    backgroundColor: "background.paper",

                }}

            >

                <Typography

                    sx={{

                        fontWeight: 600,

                        color: "primary.main",

                        fontSize: "0.875rem",

                        mb: 1,

                    }}

                >

                    {title}

                </Typography>

                <Typography

                    sx={{

                        color: value ? "text.primary" : "text.disabled",

                        fontStyle: value ? "normal" : "italic",

                        fontSize: value ? "1rem" : "0.875rem",

                    }}

                >

                    {value || t('common:noData')}

                </Typography>

            </Box>

        );

    };

  React.useEffect(() => {

    const getProfile = async () => {

      setIsLoadingProfile(true);

  try {

    const resData = await jobSeekerProfileService.getProfile();

    setProfile(resData as EnhancedJobSeekerProfile);

  } catch (error: unknown) {

    errorHandling(error);

  } finally {

    setIsLoadingProfile(false);

  }

};

getProfile();

}, [isSuccess]);

const handleUpdateProfile = (data: PersonalProfileFormValues) => {

const updateProfile = async (data: PersonalProfileFormValues) => {

  setIsFullScreenLoading(true);

  try {

    await jobSeekerProfileService.updateProfile(data as JobSeekerProfileUpdatePayload);

    dispatch(getUserInfo());

    setIsSuccess(!isSuccess);

    setOpenPopup(false);

    toastMessages.success(t('jobSeeker:profile.messages.personalUpdateSuccess'));

  } catch (error: unknown) {

    errorHandling(error);

  } finally {

    setIsFullScreenLoading(false);

  }

};

      updateProfile(data);

};

return (

  <>

    <Box

      sx={{

        backgroundColor: "background.paper",

        borderRadius: 3,

        p: 3,

        boxShadow: (theme) => theme.customShadows.card,

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

            {profile && (

              <Fab

                size="small"

                color="secondary"

                aria-label={t('common:actions.edit')}

                onClick={() => setOpenPopup(true)}

                sx={{

                  boxShadow: (theme) => theme.customShadows.medium,

                  "&:hover": {

                    transform: "scale(1.1)",

                  },

                  transition: "all 0.2s ease-in-out",

                }}

              >

                <EditIcon />

              </Fab>

            )}

          </Stack>

        </Box>

        <Divider sx={{ my: 0, borderColor: 'grey.500' }}/>

        {isLoadingProfile ? (

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

                  xl: 4

                }}>

                <Stack spacing={1.5}>

                  {item(t('jobSeeker:profile.fields.fullName'), profile?.user?.fullName)}

                  {item(t('jobSeeker:profile.fields.phone'), profile?.phone)}

                  {item(t('jobSeeker:profile.fields.gender'), tConfig(allConfig?.genderDict?.[profile?.gender as keyof typeof allConfig.genderDict]))}

                  {item(

                    t('jobSeeker:profile.fields.birthday'),

                    profile?.birthday

                      ? dayjs(profile.birthday).format("DD/MM/YYYY")

                      : profile?.birthday

                  )}

                  {item(

                    t('jobSeeker:profile.fields.maritalStatus'),

                    tConfig(allConfig?.maritalStatusDict?.[profile?.maritalStatus as keyof typeof allConfig.maritalStatusDict])

                  )}

                </Stack>

              </Grid>

              <Grid

                size={{

                  xs: 12,

                  sm: 6,

                  md: 8,

                  lg: 8,

                  xl: 8

                }}>

                <Stack spacing={1.5}>

                  {item(

                    t('common:city'),

                    tConfig(allConfig?.cityDict?.[String(profile?.location?.city)])

                  )}

                  {item(t('jobSeeker:profile.fields.district'), profile?.location?.districtDict?.name)}

                  {item(t('jobSeeker:profile.fields.address'), profile?.location?.address)}

                </Stack>

              </Grid>

            </Grid>

          </Stack>

        )}

      </Stack>

    </Box>

    {/* Start: form  */}

    <FormPopup

      title={t('jobSeeker:profile.sections.personal')}

      openPopup={openPopup}

      setOpenPopup={setOpenPopup}

    >

      <PersonalProfileForm

        handleUpdateProfile={handleUpdateProfile}

        editData={profile ? {
          user: {
            fullName: profile.user?.fullName || '',
          },
          phone: profile.phone || '',
          birthday: profile.birthday || null,
          gender: profile.gender || '',
          maritalStatus: profile.maritalStatus || '',
          location: {
            city: typeof profile.location?.city === 'object'
              ? profile.location.city.id
              : (profile.location?.city || ''),
            district: typeof profile.location?.district === 'object'
              ? profile.location.district.id
              : (profile.location?.district || ''),
            address: profile.location?.address || '',
          },
          idCardNumber: profile.idCardNumber || '',
          idCardIssueDate: profile.idCardIssueDate
            ? (typeof profile.idCardIssueDate === 'string' ? new Date(profile.idCardIssueDate) : profile.idCardIssueDate)
            : null,
          idCardIssuePlace: profile.idCardIssuePlace || '',
          taxCode: profile.taxCode || '',
          socialInsuranceNo: profile.socialInsuranceNo || '',
          permanentAddress: profile.permanentAddress || '',
          contactAddress: profile.contactAddress || '',
          emergencyContactName: profile.emergencyContactName || '',
          emergencyContactPhone: profile.emergencyContactPhone || '',
        } : null}

      />

    </FormPopup>

    {/* End: form */}

    {/* Start: full screen loading */}

    {isFullScreenLoading && <BackdropLoading />}

    {/* End: full screen loading */}

  </>

);

};

export default PersonalInfoCard;
