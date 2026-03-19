import React from "react";

import { useParams } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, Fab, IconButton, Skeleton, Stack, Typography } from "@mui/material";

import {

  Timeline,

  TimelineConnector,

  TimelineContent,

  TimelineDot,

  TimelineItem,

  timelineItemClasses,

  TimelineSeparator,

} from "@mui/lab";

import AddIcon from "@mui/icons-material/Add";

import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { confirmModal } from "../../../../utils/sweetalert2Modal";

import toastMessages from "../../../../utils/toastMessages";

import errorHandling from "../../../../utils/errorHandling";

import BackdropLoading from "../../../../components/loading/BackdropLoading";

import EmptyCard from "../../../../components/EmptyCard";

import FormPopup from "../../../../components/controls/FormPopup";

import ExperienceDetaiForm from "../ExperienceDetailForm";

import TimeAgo from '../../../../components/TimeAgo';

import resumeService from "../../../../services/resumeService";

import experienceDetailService from "../../../../services/experienceDetailService";

interface ExperienceDetail {
  id: string | number;
  startDate: string;
  endDate: string | null;
  jobName: string;
  companyName: string;
  description: string | null;
}

interface ExperienceDetailCardProps {
  title: string;
}



const Loading = (

  <Stack>

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

    <Box sx={{ px: 1 }}>

      <Box sx={{ py: 2 }}>

        <Skeleton height={5} />

      </Box>

      {Array(2)

        .fill(0)

        .map((_, index) => (

          <Box sx={{ py: 1 }} key={index}>

            <Skeleton />

            <Skeleton />

            <Skeleton />

          </Box>

        ))}

    </Box>

  </Stack>

);

const ExperienceDetailCard = ({ title }: ExperienceDetailCardProps) => {

    const { t } = useTranslation(['jobSeeker', 'common']);

    const { slug: resumeSlug } = useParams<{ slug: string }>();

  const [openPopup, setOpenPopup] = React.useState(false);

  const [isSuccess, setIsSuccess] = React.useState(false);

  const [isLoadingExperiencesDetail, setIsLoadingExperiencesDetail] =

    React.useState(true);

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  const [experiencesDetail, setExperiencesDetail] = React.useState<ExperienceDetail[]>([]);

  const [editData, setEditData] = React.useState<ExperienceDetail | null>(null);

  React.useEffect(() => {

    const loadExperiencesDetail = async (slug: string | undefined) => {
      if (!slug) return;

      setIsLoadingExperiencesDetail(true);

      try {

        const resData = await resumeService.getExperiencesDetail(slug) as any;

        setExperiencesDetail(resData.data);

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsLoadingExperiencesDetail(false);

      }

    };

    loadExperiencesDetail(resumeSlug);

  }, [resumeSlug, isSuccess]);

  const handleShowUpdate = (id: string | number) => {

    const loadExperienceDetailById = async (experienceId: string | number) => {

      setIsFullScreenLoading(true);

      try {

        const resData = await experienceDetailService.getExperienceDetailById(

          experienceId

        ) as any;

        setEditData(resData.data);

        setOpenPopup(true);

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    loadExperienceDetailById(id);

  };

  const handleShowAdd = () => {

    setEditData(null);

    setOpenPopup(true);

  };

  const handleAddOrUpdate = (data: any) => {

    const create = async (payload: any) => {

      setIsFullScreenLoading(true);

      try {

        await experienceDetailService.addExperienceDetail(payload);

        setOpenPopup(false);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('jobSeeker:profile.messages.experienceAddSuccess'));

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    const update = async (payload: any) => {

      setIsFullScreenLoading(true);

      try {

        await experienceDetailService.updateExperienceDetailById(payload.id, payload);

        setOpenPopup(false);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('jobSeeker:profile.messages.experienceUpdateSuccess'));

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    if ("id" in data) {

      update(data);

    } else {

      // create

      const dataCustom = {

        ...data,

        resume: resumeSlug,

      };

      create(dataCustom);

    }

  };

  const handleDeleteExperiencesDetail = (id: string | number) => {

    const del = async (experienceId: string | number) => {

      try {

        await experienceDetailService.deleteExperienceDetailById(experienceId);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('jobSeeker:profile.messages.experienceDeleteSuccess'));

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    confirmModal(

      () => del(id),

      t('jobSeeker:profile.messages.deleteConfirmTitle', { item: t('jobSeeker:profile.sections.experience') }),

      t('jobSeeker:profile.messages.deleteConfirmWarning'),

      "warning"

    );

  };

  return (

    <>

      <Box

        sx={{

          backgroundColor: "background.paper",

          borderRadius: 3,

          p: 3,

          boxShadow: (theme: any) => theme.customShadows.card,

        }}

      >

        {isLoadingExperiencesDetail ? (

          Loading

        ) : (

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

                <Fab

                  size="small"

                  color="primary"

                  aria-label={t('common:actions.add')}

                  onClick={handleShowAdd}

                  sx={{

                    boxShadow: (theme: any) => theme.customShadows.medium,

                    "&:hover": {

                      transform: "scale(1.1)",

                    },

                    transition: "all 0.2s ease-in-out",

                  }}

                >

                  <AddIcon />

                </Fab>

              </Stack>

            </Box>

            <Divider sx={{ my: 0, borderColor: "grey.500" }} />

            <Box>

              {experiencesDetail.length === 0 ? (

                <EmptyCard

                  content={t('jobSeeker:profile.messages.noExperienceData')}

                  onClick={handleShowAdd}

                />

              ) : (

                <Timeline

                  sx={{

                    [`& .${timelineItemClasses.root}:before`]: {

                      flex: 0,

                      padding: 0,

                    },

                    mt: 0,

                  }}

                >

                  {experiencesDetail.map((value) => (

                    <TimelineItem key={value.id}>

                      <TimelineSeparator>

                        <TimelineDot

                          sx={{

                            background: (theme: any) =>

                              theme.palette.primary.gradient,

                            boxShadow: (theme: any) => theme.customShadows.small,

                          }}

                        />

                        <TimelineConnector sx={{ bgcolor: "primary.light" }} />

                      </TimelineSeparator>

                      <TimelineContent>

                        <Box

                          sx={{

                            p: 1,

                          }}

                        >

                          <Typography

                            variant="body2"

                            color="primary.main"

                            sx={{ fontWeight: 600, mb: 1 }}

                          >

                            <TimeAgo date={value.startDate} type="format" format="DD/MM/YYYY"/>{" "}

                            -{" "}

                            {value.endDate ? (

                              <TimeAgo date={value.endDate} type="format" format="DD/MM/YYYY"/>

                            ) : (

                              t('jobSeeker:profile.fields.present')

                            )}

                          </Typography>

                          <Typography

                            variant="h6"

                            gutterBottom

                            sx={{

                              fontWeight: "bold",

                              color: "text.primary",

                            }}

                          >

                            {value.jobName}

                          </Typography>

                          <Typography

                            variant="body1"

                            sx={{

                              color: "text.secondary",

                              mb: 2,

                            }}

                          >

                            {value.companyName}

                          </Typography>

                          <Stack direction="row" spacing={1}>

                            <IconButton

                              size="small"

                              sx={{

                                color: "secondary.main",

                                bgcolor: "secondary.background",

                                "&:hover": {

                                  bgcolor: "secondary.light",

                                  color: "white",

                                },

                              }}

                              onClick={() => handleShowUpdate(value.id)}

                            >

                              <ModeEditOutlineOutlinedIcon fontSize="small" />

                            </IconButton>

                            <IconButton

                              size="small"

                              sx={{

                                color: "error.main",

                                bgcolor: "error.background",

                                "&:hover": {

                                  bgcolor: "error.main",

                                  color: "white",

                                },

                              }}

                              onClick={() =>

                                handleDeleteExperiencesDetail(value.id)

                              }

                            >

                              <DeleteOutlineOutlinedIcon fontSize="small" />

                            </IconButton>

                          </Stack>

                          <Accordion

                            sx={{

                              boxShadow: "none",

                              bgcolor: "transparent",

                              "&:before": {

                                display: "none",

                              },

                            }}

                          >

                            <AccordionSummary

                              expandIcon={

                                <ExpandMoreIcon

                                  sx={{

                                    color: "primary.main",

                                    fontSize: 20,

                                  }}

                                />

                              }

                            >

                              <Typography

                                variant="body2"

                                sx={{

                                  color: "text.secondary",

                                  fontWeight: 500,

                                }}

                              >

                                {t('jobSeeker:profile.fields.description')}

                              </Typography>

                            </AccordionSummary>

                            <AccordionDetails>

                              <Typography

                                variant="body2"

                                sx={{

                                  color: value.description

                                    ? "text.primary"

                                    : "text.placeholder",

                                  fontStyle: value.description

                                    ? "normal"

                                    : "italic",

                                }}

                              >

                                {value.description || t('common:noData')}

                              </Typography>

                            </AccordionDetails>

                          </Accordion>

                        </Box>

                      </TimelineContent>

                    </TimelineItem>

                  ))}

                </Timeline>

              )}

            </Box>

          </Stack>

        )}

      </Box>

      {/* Start: form  */}

      <FormPopup

        title={t('jobSeeker:profile.sections.experience')}

        openPopup={openPopup}

        setOpenPopup={setOpenPopup}

      >

        <ExperienceDetaiForm

          handleAddOrUpdate={handleAddOrUpdate}

          editData={editData}

        />

      </FormPopup>

      {/* End: form */}

      {/* Start: full screen loading */}

      {isFullScreenLoading && <BackdropLoading />}

      {/* End: full screen loading */}

    </>

  );

};

export default ExperienceDetailCard;
