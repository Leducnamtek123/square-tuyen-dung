import React from "react";
import { useAppSelector } from '@/redux/hooks';

import { useDispatch } from "react-redux";

import { useTranslation } from "react-i18next";

import { Box, Button, Divider, Stack, Typography } from "@mui/material";

import Grid from "@mui/material/Grid2";

import PublishIcon from "@mui/icons-material/Publish";

import {CV_TYPES} from "../../../../configs/constants";

import toastMessages from "../../../../utils/toastMessages";

import errorHandling from "../../../../utils/errorHandling";

import BackdropLoading from "../../../../components/Common/Loading/BackdropLoading";

import FormPopup from "../../../../components/Common/Controls/FormPopup";

import ProfileUploadForm from "../ProfileUploadForm";

import jobSeekerProfileService from "../../../../services/jobSeekerProfileService";

import resumeService from "../../../../services/resumeService";

import ProfileUploadCard from "../../../../components/Common/ProfileUploadCard";

import { confirmModal } from "../../../../utils/sweetalert2Modal";

import NoDataCard from "../../../../components/Common/NoDataCard";

import { reloadResume } from "../../../../redux/profileSlice";

interface Resume {
  id: string | number;
  imageUrl?: string;
  fileUrl: string;
  title: string;
  updateAt: string;
  slug: string;
  isActive: boolean;
}

interface ProfileUploadProps {
  title: string;
}



const ProfileUpload = ({ title }: ProfileUploadProps) => {

  const { t } = useTranslation(['jobSeeker', 'common']);

  const dispatch = useDispatch();

  const {

    resume: { isReloadResume },

  } = useAppSelector((state) => state.profile);

  const { currentUser } = useAppSelector((state) => state.user);

  const [isLoadingResumes, setIsLoadingResumes] = React.useState(false);

  const [resumes, setResumes] = React.useState<Resume[]>([]);

  const [openPopup, setOpenPopup] = React.useState(false);

  const [isSuccess, setIsSuccess] = React.useState(false);

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  React.useEffect(() => {

    const getOnlineProfile = async (jobSeekerProfileId: string | number | undefined, params: any) => {
      if (!jobSeekerProfileId) return;

      setIsLoadingResumes(true);

      try {

        const resData = await jobSeekerProfileService.getResumes(

          jobSeekerProfileId,

          params

        ) as any;

        setResumes(resData.data);

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsLoadingResumes(false);

      }

    };

    getOnlineProfile((currentUser as any)?.jobSeekerProfile?.id || (currentUser as any)?.jobSeekerProfileId, {

      resumeType: CV_TYPES.cvUpload,

    });

  }, [currentUser, isSuccess, isReloadResume]);

  const handleAdd = (data: any) => {

    const addResumeUpload = async (formData: FormData) => {

      setIsFullScreenLoading(true);

      try {

        await resumeService.addResume(formData);

        setOpenPopup(false);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('jobSeeker:profile.messages.resumeUploadSuccess'));

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    const formData = new FormData();

    for (const key in data) {

      formData.append(key, data[key]);

    }

    addResumeUpload(formData);

  };

  const handleDelete = (slug: string) => {

    const del = async (resumeSlug: string) => {

      try {

        await resumeService.deleteResume(resumeSlug);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('jobSeeker:profile.messages.resumeDeleteSuccess'));

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    confirmModal(

      () => del(slug),

      t('jobSeeker:profile.messages.deleteConfirmTitle', { item: t('jobSeeker:attachedProfile.sections.cv') }),

      t('jobSeeker:profile.messages.deleteConfirmWarning'),

      "warning"

    );

  };

  const handleActive = (slug: string) => {

    const activeResume = async (resumeSlug: string) => {

      setIsFullScreenLoading(true);

      try {

        await resumeService.activeResume(resumeSlug);

        dispatch(reloadResume());

        toastMessages.success(t('jobSeeker:profile.messages.profileStatusUpdateSuccess'));

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    activeResume(slug);

  };

  return (

    <>

      <Stack>

        <Box>

          <Typography variant="h5">

            {title} (<span style={{ color: "red" }}>{resumes.length}</span>)

          </Typography>

        </Box>

        <Divider sx={{ mt: 2, mb: 3, borderColor: 'grey.500' }} />

        <Box sx={{ px: 1 }}>

          <Box>

            <Box>

              {isLoadingResumes ? (

                <Grid container spacing={2}>

                  {Array.from(Array(3).keys()).map((_, index) => (

                    <Grid

                      key={index}

                      size={{

                        xs: 12,

                        sm: 12,

                        md: 6,

                        lg: 4,

                        xl: 4

                      }}>

                      <ProfileUploadCard.Loading />

                    </Grid>

                  ))}

                </Grid>

              ) : resumes.length === 0 ? (

                <NoDataCard

                  title={t('jobSeeker:profile.messages.noResumeData')}

                  svgKey="ImageSvg2"

                />

              ) : (

                <Grid container spacing={2}>

                  {resumes.map((value) => (

                    <Grid

                      key={value.id}

                      size={{

                        xs: 12,

                        sm: 12,

                        md: 6,

                        lg: 4,

                        xl: 4

                      }}>

                      <ProfileUploadCard
                        resumeImage={value.imageUrl || ''}
                        fileUrl={value.fileUrl}
                        title={value.title}
                        updateAt={value.updateAt}
                        slug={value.slug}
                        id={value.id}
                        isActive={value.isActive}
                        handleDelete={handleDelete}
                        handleActive={handleActive}
                      />

                    </Grid>

                  ))}

                </Grid>

              )}

            </Box>

            <Stack sx={{ pt: 5 }} direction="row" justifyContent="center">

              <Button

                variant="contained"

                startIcon={<PublishIcon />}

                onClick={() => setOpenPopup(true)}

                sx={{

                  px: 4,

                  py: 1.5,

                  background: (theme: any) => theme.palette.primary.main,

                  "&:hover": {

                    background: (theme: any) => theme.palette.primary.main,

                    opacity: 0.9,

                  },

                }}

              >

                {t('jobSeeker:attachedProfile.sidebar.cv')}

              </Button>

            </Stack>

          </Box>

        </Box>

      </Stack>

      {/* Start: form  */}

      <FormPopup

        title={t('jobSeeker:profile.sections.resume')}

        openPopup={openPopup}

        setOpenPopup={setOpenPopup}

      >

        <ProfileUploadForm handleAdd={handleAdd} />

      </FormPopup>

      {/* End: form */}

      {/* Start: full screen loading */}

      {isFullScreenLoading && <BackdropLoading />}

      {/* End: full screen loading */}

    </>

  );

};

export default ProfileUpload;
