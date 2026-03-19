import React, { Suspense, lazy } from "react";

import { useTranslation } from 'react-i18next';

import { useParams } from "react-router-dom";

import { useSelector } from "react-redux";

import { Avatar, Box, Card, Divider, Rating, Stack, Typography, Button, Skeleton, Chip, CircularProgress, Tooltip } from "@mui/material";

import Grid from "@mui/material/Grid2";

import ReactToPrint from "react-to-print";

import dayjs from "dayjs";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faFilePdf } from "@fortawesome/free-regular-svg-icons";

import DownloadIcon from "@mui/icons-material/Download";

import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";

import FavoriteIcon from "@mui/icons-material/Favorite";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

import PrintIcon from "@mui/icons-material/Print";

import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";

import PsychologyIcon from "@mui/icons-material/Psychology";

import { useMediaQuery } from "@mui/material";

import defaultTheme from "../../../../themeConfigs/defaultTheme";

import { CV_TYPES } from "../../../../configs/constants";

import BackdropLoading from "../../../../components/loading/BackdropLoading";

import { convertEditorStateToHTMLString } from "../../../../utils/editorUtils";

import { salaryString } from "../../../../utils/customData";

import resumeService from "../../../../services/resumeService";

import errorHandling from "../../../../utils/errorHandling";

import TimeAgo from "../../../../components/TimeAgo";

import FormPopup from "../../../../components/controls/FormPopup";

const LazyPdf = lazy(() => import("../../../../components/Pdf"));

const ProfileDetailCard: React.FC = () => {
  const { t } = useTranslation('employer');
  const { slug } = useParams<{ slug: string }>();
  const { allConfig } = useSelector((state: any) => state.config);
  
  const [profileDetail, setProfileDetail] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [openPopup, setOpenPopup] = React.useState(false);

  React.useEffect(() => {
    const getProfileDetail = async () => {
      setIsLoading(true);
      try {
        const resData = await resumeService.getResumeDetail(slug as string) as any;
        setProfileDetail(resData.data);
      } catch (error: any) {
        errorHandling(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) {
      getProfileDetail();
    }
  }, [slug]);

  const item = (t: any, label: string, value: any) => (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: 1,
          display: 'block',
          mb: 0.5
        }}
      >
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value || t('common.notUpdated')}
      </Typography>
    </Box>
  );

  if (isLoading) return <BackdropLoading open={true} />;
  if (!profileDetail) return null;

  return (
    <>
      <Stack spacing={3}>
        <Card
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 3,
            boxShadow: (theme: any) => theme.customShadows.medium,
          }}
        >
          <Stack spacing={4}>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  color: (theme: any) => theme.palette.primary.main,
                  borderBottom: "2px solid",
                  borderColor: (theme: any) => theme.palette.primary.light,
                  pb: 1,
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                }}
              >


                      {t('profileDetailCard.title.personalInfo')}

                    </Typography>

                    <Grid container>

                      <Grid

                        size={{

                          xs: 12,

                          sm: 6,

                          md: 4

                        }}>

                        {item(t, "Email", profileDetail?.user?.email)}

                      </Grid>

                      <Grid

                        size={{

                          xs: 12,

                          sm: 6,

                          md: 4

                        }}>

                        {item(

                          t,

                          t('profileDetailCard.label.phone'),

                          profileDetail?.jobSeekerProfile?.phone

                        )}

                      </Grid>

                      <Grid

                        size={{

                          xs: 12,

                          sm: 6,

                          md: 4

                        }}>

                        {item(

                          t,

                          t('profileDetailCard.label.gender'),

                          allConfig?.genderDict[

                            profileDetail?.jobSeekerProfile?.gender

                          ]

                        )}

                      </Grid>

                      <Grid

                        size={{

                          xs: 12,

                          sm: 6,

                          md: 4

                        }}>

                        {item(

                          t,

                          t('profileDetailCard.label.dob'),

                          <TimeAgo date={profileDetail?.jobSeekerProfile?.birthday} type="format" />

                        )}

                      </Grid>

                      <Grid

                        size={{

                          xs: 12,

                          sm: 6,

                          md: 4

                        }}>

                        {item(

                          t,

                          t('profileDetailCard.label.maritalStatus'),

                          allConfig?.maritalStatusDict[

                            profileDetail?.jobSeekerProfile?.maritalStatus

                          ]

                        )}

                      </Grid>

                      <Grid

                        size={{

                          xs: 12,

                          sm: 6,

                          md: 4

                        }}>

                        {item(

                          t,

                          t('profileDetailCard.label.cityProvince'),

                          allConfig?.cityDict[

                            profileDetail?.jobSeekerProfile?.location?.city

                          ]

                        )}

                      </Grid>

                      <Grid

                        size={{

                          xs: 12,

                          sm: 6,

                          md: 4

                        }}>

                        {item(

                          t,

                          t('profileDetailCard.label.district'),

                          profileDetail?.jobSeekerProfile?.location

                            ?.districtDict?.name

                        )}

                      </Grid>

                      <Grid

                        size={{

                          xs: 12,

                          sm: 6,

                          md: 4

                        }}>

                        {item(

                          t,

                          t('profileDetailCard.label.address'),

                          profileDetail?.jobSeekerProfile?.location?.address

                        )}

                      </Grid>

                    </Grid>

                  </Box>

                  {/* General info section - similar responsive pattern */}

                  <Box>

                    <Typography

                      variant="h5"

                      sx={{

                        mb: 2,

                        color: (theme) => theme.palette.primary.main,

                        borderBottom: "2px solid",

                        borderColor: (theme) => theme.palette.primary.light,

                        pb: 1,

                        fontSize: { xs: "1.25rem", sm: "1.5rem" },

                      }}

                    >

                      {t('profileDetailCard.title.generalInfo')}

                    </Typography>

                    <Grid container>

                      <Grid

                        size={{

                          xs: 12,

                          sm: 6,

                          md: 4

                        }}>

                        {item(t, t('profileDetailCard.label.desiredPosition'), profileDetail?.title)}

                      </Grid>

                      <Grid

                        size={{

                          xs: 12,

                          sm: 6,

                          md: 4

                        }}>

                        {item(

                          t,

                          t('profileDetailCard.label.desiredLevel'),

                          allConfig?.positionDict[profileDetail?.position]

                        )}

                      </Grid>

                      <Grid

                        size={{

                          xs: 12,

                          sm: 6,

                          md: 4

                        }}>

                        {item(

                          t,

                          t('profileDetailCard.label.educationLevel'),

                          allConfig?.academicLevelDict[

                            profileDetail?.academicLevel

                          ]

                        )}

                      </Grid>

                      <Grid

                        size={{

                          xs: 12,

                          sm: 6,

                          md: 4

                        }}>

                        {item(

                          t,

                          t('profileDetailCard.label.experience'),

                          allConfig?.experienceDict[profileDetail?.experience]

                        )}

                      </Grid>

                      <Grid

                        size={{

                          xs: 12,

                          sm: 6,

                          md: 4

                        }}>

                        {item(

                          t,

                          t('profileDetailCard.label.career'),

                          allConfig?.careerDict[profileDetail?.career]

                        )}

                      </Grid>

                      <Grid

                        size={{

                          xs: 12,

                          sm: 6,

                          md: 4

                        }}>

                        {item(

                          t,

                          t('profileDetailCard.label.workLocation'),

                          allConfig?.cityDict[profileDetail?.city]

                        )}

                      </Grid>

                      <Grid

                        size={{

                          xs: 12,

                          sm: 6,

                          md: 4

                        }}>

                        {item(

                          t,

                          t('profileDetailCard.label.desiredSalary'),

                          salaryString(

                            profileDetail?.salaryMin,

                            profileDetail?.salaryMax

                          )

                        )}

                      </Grid>

                      <Grid

                        size={{

                          xs: 12,

                          sm: 6,

                          md: 4

                        }}>

                        {item(

                          t,

                          t('profileDetailCard.label.workplaceType'),

                          allConfig?.typeOfWorkplaceDict[

                            profileDetail?.typeOfWorkplace

                          ]

                        )}

                      </Grid>

                      <Grid

                        size={{

                          xs: 12,

                          sm: 6,

                          md: 4

                        }}>

                        {item(

                          t,

                          t('profileDetailCard.label.jobType'),

                          allConfig?.jobTypeDict[profileDetail?.jobType]

                        )}

                      </Grid>

                    </Grid>

                  </Box>

                  {/* Career goals section */}

                  <Box>

                    <Typography

                      variant="h5"

                      sx={{

                        mb: 2,

                        color: (theme) => theme.palette.primary.main,

                        borderBottom: "2px solid",

                        borderColor: (theme) => theme.palette.primary.light,

                        pb: 1,

                        fontSize: { xs: "1.25rem", sm: "1.5rem" },

                      }}

                    >

                      {t('profileDetailCard.title.careerGoals')}

                    </Typography>

                    <Card

                      variant="outlined"

                      sx={{

                        p: 3,

                        background: (theme: any) => theme.palette.grey[50],

                        border: "1px solid",

                        borderColor: (theme: any) => theme.palette.grey[200],

                        boxShadow: 0,

                      }}

                    >

                      <Typography

                         sx={{
                          color: profileDetail?.description
                            ? defaultTheme.palette.text.primary
                            : defaultTheme.palette.text.disabled,
                          fontStyle: profileDetail?.description
                            ? "normal"
                            : "italic",
                          fontSize: profileDetail?.description
                            ? "0.95rem"
                            : (defaultTheme.palette.text as any).disabled?.fontSize || '0.875rem',
                          lineHeight: 1.6,
                        }}

                      >

                        {profileDetail?.description || t('common.notUpdated')}

                      </Typography>

                    </Card>

                  </Box>

                </Stack>

              </Card>

            </Stack>



          {profileDetail?.type && profileDetail.type === CV_TYPES.cvWebsite ? (

            <>

              {/* Start: Experience */}{" "}

              {(profileDetail?.experiencesDetails || []).length > 0 && (

                <Box sx={{ mt: 2 }}>

                  <Typography variant="h5" sx={{ mb: 1.5 }}>

                    {t('profileDetailCard.title.workExperience')}

                  </Typography>

                  <Box>

                    <Card

                      variant="outlined"

                      sx={{ p: 2, borderWidth: 2, boxShadow: 0 }}

                    >

                      <Grid container spacing={1}>

                        {profileDetail.experiencesDetails.map(
                          (value: any, index: number) => (

                            <>

                              <Grid key={value.id} size={5}>

                                <Typography

                                  sx={{

                                    fontSize: 17.5,

                                    fontWeight: "bold",

                                    mb: 0.5,

                                  }}

                                >

                                  {value?.jobName}

                                </Typography>

                                <Typography

                                  sx={{ fontWeight: "bold", fontSize: 15 }}

                                >

                                  {value?.companyName}

                                </Typography>

                                <Typography sx={{ color: "gray" }}>

                                  {<TimeAgo date={value?.startDate} type="format" />}{" "}

                                  - {<TimeAgo date={value?.endDate} type="format" />}

                                </Typography>

                              </Grid>

                              <Grid size={7}>

                                <Typography>

                                  {value?.description || (

                                    <span

                                      style={{

                                        color: "#e0e0e0",

                                        fontStyle: "italic",

                                        fontSize: 13,

                                      }}

                                    >

                                      {t('common.notUpdated')}

                                    </span>

                                  )}

                                </Typography>

                              </Grid>

                              {index <

                                profileDetail.experiencesDetails.length - 1 && (

                                <Grid size={12}>

                                  <Divider />

                                </Grid>

                              )}

                            </>

                          )

                        )}

                      </Grid>

                    </Card>

                  </Box>

                </Box>

              )}

              {/* End: Experience */}

              {/* Start: Education */}

              {(profileDetail?.educationDetails || []).length > 0 && (

                <Box sx={{ mt: 2 }}>

                  <Typography variant="h5" sx={{ mb: 1.5 }}>

                    {t('profileDetailCard.title.education')}

                  </Typography>

                  <Box>

                    <Card

                      variant="outlined"

                      sx={{ p: 2, borderWidth: 2, boxShadow: 0 }}

                    >

                      <Grid container spacing={1}>

                        {profileDetail.educationDetails.map((value: any, index: number) => (

                          <>

                            <Grid key={value.id} size={12}>

                              <Typography

                                sx={{

                                  fontSize: 17.5,

                                  fontWeight: "bold",

                                  mb: 0.5,

                                }}

                              >

                                {value?.degreeName} - {t('profileDetailCard.label.major')}:{" "}

                                {value?.major}

                              </Typography>

                              <Typography

                                sx={{ fontWeight: "bold", fontSize: 15 }}

                              >

                                {value?.trainingPlaceName}

                              </Typography>

                              <Typography sx={{ color: "gray" }}>

                                <TimeAgo date={value?.startDate} type="format" />{" "}

                                -{" "}

                                {value.completedDate ? (

                                  <TimeAgo date={value?.completedDate} type="format" />

                                ) : (

                                  t('common.present')

                                )}

                              </Typography>

                            </Grid>

                            {index <

                              profileDetail.educationDetails.length - 1 && (

                              <Grid size={12}>

                                <Divider />

                              </Grid>

                            )}

                          </>

                        ))}

                      </Grid>

                    </Card>

                  </Box>

                </Box>

              )}

              {/* End: Education */}

              {/* Start: Cerfiticate */}

              {(profileDetail?.certificates || []).length > 0 && (

                <Box sx={{ mt: 2 }}>

                  <Typography variant="h5" sx={{ mb: 1.5 }}>

                    {t('profileDetailCard.title.certificates')}

                  </Typography>

                  <Box>

                    <Card

                      variant="outlined"

                      sx={{ p: 2, borderWidth: 2, boxShadow: 0 }}

                    >

                      <Grid container spacing={1}>

                        {profileDetail.certificates.map((value: any, index: number) => (

                          <>

                            <Grid key={value.id} size={12}>

                              <Typography

                                sx={{

                                  fontSize: 17.5,

                                  fontWeight: "bold",

                                  mb: 0.5,

                                }}

                              >

                                {value?.name}

                              </Typography>

                              <Typography

                                sx={{ fontWeight: "bold", fontSize: 15 }}

                              >

                                {value?.trainingPlace}

                              </Typography>

                              <Typography sx={{ color: "gray" }}>

                                {value.expirationDate ? (

                                  <>

                                    <TimeAgo date={value.startDate} type="format" />{" "}

                                    -{" "}

                                    <TimeAgo date={value.expirationDate} type="format" />

                                  </>

                                ) : (

                                  t('profileDetailCard.label.noExpiration')

                                )}

                              </Typography>

                            </Grid>

                            {index < profileDetail.certificates.length - 1 && (

                              <Grid size={12}>

                                <Divider />

                              </Grid>

                            )}

                          </>

                        ))}

                      </Grid>

                    </Card>

                  </Box>

                </Box>

              )}

              {/* End: Cerfiticate */}

              {/* Start: Language */}

              {(profileDetail?.languageSkills || []).length > 0 && (

                <Box sx={{ mt: 2 }}>

                  <Typography variant="h5" sx={{ mb: 1.5 }}>

                    {t('profileDetailCard.title.languages')}

                  </Typography>

                  <Box>

                    <Card

                      variant="outlined"

                      sx={{ p: 2, borderWidth: 2, boxShadow: 0 }}

                    >

                      <Grid container spacing={1}>

                        {profileDetail.languageSkills.map((value: any, index: number) => (

                          <>

                            <Grid key={value.id} size={12}>

                              <Typography

                                sx={{

                                  fontSize: 17.5,

                                  fontWeight: "bold",

                                  mb: 0.5,

                                }}

                              >

                                {allConfig?.languageDict[value?.language]}

                              </Typography>

                              <Typography

                                sx={{

                                  fontWeight: "bold",

                                  fontSize: 13,

                                  color: "gray",

                                }}

                              >

                                {t('profileDetailCard.label.proficiency')}

                              </Typography>

                              <Rating

                                value={value?.level || 0}

                                size="medium"

                                readOnly

                              />

                            </Grid>

                            {index <

                              profileDetail.languageSkills.length - 1 && (

                              <Grid size={12}>

                                <Divider />

                              </Grid>

                            )}

                          </>

                        ))}

                      </Grid>

                    </Card>

                  </Box>

                </Box>

              )}

              {/* End: Language */}

              {/* Start: Skill advanced */}

              {(profileDetail?.advancedSkills || []).length > 0 && (

                <Box sx={{ mt: 2 }}>

                  <Typography variant="h5" sx={{ mb: 1.5 }}>

                    {t('profileDetailCard.title.advancedSkills')}

                  </Typography>

                  <Box>

                    <Card

                      variant="outlined"

                      sx={{ p: 2, borderWidth: 2, boxShadow: 0 }}

                    >

                      <Grid container spacing={1}>

                        {profileDetail.advancedSkills.map((value: any, index: number) => (

                          <>

                            <Grid key={value.id} size={12}>

                              <Typography

                                sx={{

                                  fontSize: 17.5,

                                  fontWeight: "bold",

                                  mb: 0.5,

                                }}

                              >

                                {value?.name}

                              </Typography>

                              <Typography

                                sx={{

                                  fontWeight: "bold",

                                  fontSize: 13,

                                  color: "gray",

                                }}

                              >

                                {t('profileDetailCard.label.proficiency')}

                              </Typography>

                              <Rating

                                value={value?.level || 0}

                                readOnly

                                size="medium"

                              />

                            </Grid>

                            {index <

                              profileDetail.advancedSkills.length - 1 && (

                              <Grid size={12}>

                                <Divider />

                              </Grid>

                            )}

                          </>

                        ))}

                      </Grid>

                    </Card>

                  </Box>

                </Box>

              )}

              {/* End: Skill advanced */}

            </>

          ) : (

            <>

              {/* Start: Popup  */}

                <FormPopup

                title={t('sendEmailComponent.title.viewattachedresume')}

                openPopup={openPopup}

                setOpenPopup={setOpenPopup}

                showDialogAction={false}

              >

                <Suspense

                  fallback={(

                    <Box sx={{ p: 3, textAlign: "center" }}>

                      <Typography variant="subtitle2" color="text.secondary">

                        {t('profileDetailCard.messages.loadingPdf')}

                      </Typography>

                    </Box>

                  )}

                >

                  <LazyPdf

                    fileUrl={profileDetail?.fileUrl}

                    title={profileDetail?.title}

                  />

                </Suspense>

              </FormPopup>

              {/* End: Popup */}

            </>

          )}


    </>

  );

};

export default ProfileDetailCard;
