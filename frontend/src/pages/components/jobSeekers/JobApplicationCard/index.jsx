import React from "react";

import { useSelector } from "react-redux";

import { useNavigate } from "react-router-dom";

import { Avatar, Box, IconButton, List, ListItem, ListItemAvatar, ListItemText, Skeleton, Stack, Tooltip, Typography } from "@mui/material";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";

import { useTranslation } from "react-i18next";

import dayjs from "dayjs";

import jobSeekerProfileService from "../../../../services/jobSeekerProfileService";

import { CV_TYPES, ROUTES } from "../../../../configs/constants";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const JobApplicationCard = () => {

  const { t } = useTranslation(['jobSeeker', 'common']);

  const nav = useNavigate();

  const { currentUser } = useSelector((state) => state.user);

  const [isLoading, setIsLoading] = React.useState(true);

  const [data, setData] = React.useState([]);

  React.useEffect(() => {

    const getOnlineProfile = async (jobSeekerProfileId, params) => {

      setIsLoading(true);

      try {

        const resData = await jobSeekerProfileService.getResumes(

          jobSeekerProfileId,

          params

        );

        setData(resData.data);

      } catch (error) {

        console.log(error);

      } finally {

        setIsLoading(false);

      }

    };

    getOnlineProfile(currentUser?.jobSeekerProfileId);

  }, [currentUser]);

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

            nav(`/${ROUTES.JOB_SEEKER.DASHBOARD}/${ROUTES.JOB_SEEKER.PROFILE}`)

          }

          sx={{

            "&:hover": {

              backgroundColor: (theme) => theme.palette.primary.background,

              color: (theme) => theme.palette.primary.main,

            },

          }}

        >

          <ArrowForwardIcon />

        </IconButton>

      </Stack>

      <Box>

        {isLoading ? (

          <Stack spacing={1}>

            {Array.from({ length: 3 }).map((_, idx) => (

              <Skeleton key={idx} variant="rounded" height={72} />

            ))}

          </Stack>

        ) : (

          <List disablePadding>

            {data.map((item) => (

              <ListItem

                key={item?.id || item?.title}

                sx={{

                  p: 2,

                  mb: 1,

                  background: (theme) => theme.palette.grey[50],

                  borderRadius: 2,

                  cursor: "pointer",

                  transition: "all 0.2s ease-in-out",

                  "&:hover": {

                    transform: "translateY(-2px)",

                    boxShadow: (theme) => theme.customShadows.small,

                  },

                }}

              >

                <ListItemAvatar>

                  {item?.type === CV_TYPES.cvWebsite ? (

                    <Tooltip title={t('jobSeeker:jobApplication.onlineProfile')}>

                      <Avatar

                        sx={{

                          bgcolor: (theme) => theme.palette.primary.main,

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

                          bgcolor: (theme) => theme.palette.hot.main,

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

                        {t('common:labels.lastModified')} {dayjs(item?.updateAt).format("DD/MM/YYYY")}

                      </Typography>

                      <Typography

                        variant="body2"

                        sx={{

                          color: item?.isActive

                            ? (theme) => theme.palette.success.main

                            : (theme) => theme.palette.hot.main,

                          fontWeight: 500,

                        }}

                      >

                        {item?.isActive

                          ? t('common:status.searchable')

                          : t('common:status.notSearchable')}

                      </Typography>

                    </Stack>

                  }

                  secondaryTypographyProps={{ component: "div" }}

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
