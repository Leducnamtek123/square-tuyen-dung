import React from 'react';

import { useSelector } from 'react-redux';

import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';

import { Card, CircularProgress, FormControlLabel, Link, Radio, RadioGroup, Stack, Typography } from "@mui/material";

import Grid from "@mui/material/Grid2";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faEye, faFile, faFilePdf } from '@fortawesome/free-regular-svg-icons';

import errorHandling from '../../utils/errorHandling';

import { CV_TYPES, REGEX_VATIDATE, ROUTES } from '../../configs/constants';

import TextFieldCustom from '../controls/TextFieldCustom';

import jobSeekerProfileService from '../../services/jobSeekerProfileService';

import { formatRoute } from '../../utils/funcUtils';

const ApplyForm = ({ handleApplyJob }) => {

  const { currentUser } = useSelector((state) => state.user);

  const [isLoadingResumes, setIsLoadingResumes] = React.useState(false);

  const [resumes, setResumes] = React.useState([]);

  const schema = yup.object().shape({

    fullName: yup

      .string()

      .required('Full name is required.')

      .max(100, 'Full name exceeds allowed length.'),

    email: yup

      .string()

      .required('Email is required.')

      .email('Invalid email.')

      .max(100, 'Email exceeds allowed length.'),

    phone: yup

      .string()

      .required('Phone number is required.')

      .matches(REGEX_VATIDATE.phoneRegExp, 'Invalid phone number.')

      .max(15, 'Phone number exceeds allowed length.'),

  });

  const { control, setValue, handleSubmit } = useForm({

    defaultValues: {

      fullName: currentUser.fullName,

      email: currentUser.email,

      phone: currentUser?.jobSeekerProfile?.phone || '',

      resume: '',

    },

    resolver: yupResolver(schema),

  });

  React.useEffect(() => {

    const getOnlineProfile = async (jobSeekerProfileId, params) => {

      setIsLoadingResumes(true);

      try {

        const resData = await jobSeekerProfileService.getResumes(

          jobSeekerProfileId,

          params

        );

        setResumes(resData.data);

      } catch (error) {

        errorHandling(error);

      } finally {

        setIsLoadingResumes(false);

      }

    };

    getOnlineProfile(currentUser?.jobSeekerProfileId);

  }, [currentUser]);

  return (

    <>

      <form id="modal-form" onSubmit={handleSubmit(handleApplyJob)}>

        <Grid container spacing={2}>

          <Grid size={12}>

            <Stack spacing={1} justifyContent="center">

              {isLoadingResumes ? (

                <CircularProgress color="secondary" sx={{ margin: '0 auto' }} />

              ) : (

                <RadioGroup

                  aria-labelledby="resume"

                  defaultValue={() => {

                    let defaultResumes = resumes.filter(

                      (value) => value.type === CV_TYPES.cvWebsite

                    );

                    if (defaultResumes.length > 0) {

                      setValue('resume', `${defaultResumes[0].id}`)

                      return defaultResumes[0].id;

                    } else if (resumes.length > 0) {

                      setValue('resume', `${resumes[0].id}`)

                      return resumes[0].id;

                    }

                  }}

                  name="resume"

                  onChange={(event) => setValue('resume', event.target.value)}

                >

                  <Stack spacing={1.5}>
                    {resumes.map((value) => (
                      <Card 
                        sx={{ 
                          p: 1.5,
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'rgba(68, 29, 160, 0.02)'
                          }
                        }} 
                        variant="outlined" 
                        key={value.id}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                          <FormControlLabel
                            value={value.id}
                            control={<Radio />}
                            label={
                              <Stack spacing={0.5}>
                                {value?.title && (
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                    {value.title}
                                  </Typography>
                                )}
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <FontAwesomeIcon
                                    icon={value.type === CV_TYPES.cvWebsite ? faFile : faFilePdf}
                                    color={value.type === CV_TYPES.cvWebsite ? "#441da0" : "red"}
                                    size="sm"
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                                  >
                                    {value.type === CV_TYPES.cvWebsite ? 'Hồ sơ trực tuyến' : 'Hồ sơ đính kèm'}
                                  </Typography>
                                </Stack>
                              </Stack>
                            }
                            sx={{ 
                              flex: 1,
                              ml: 0,
                              mr: 0,
                              '& .MuiFormControlLabel-label': {
                                flex: 1
                              }
                            }}
                          />
                          <Link
                            target="_blank"
                            href={
                              value.type === CV_TYPES.cvWebsite
                                ? `/${ROUTES.JOB_SEEKER.DASHBOARD}/${formatRoute(ROUTES.JOB_SEEKER.STEP_PROFILE, value.slug)}`
                                : `/${ROUTES.JOB_SEEKER.DASHBOARD}/${formatRoute(ROUTES.JOB_SEEKER.ATTACHED_PROFILE, value.slug)}`
                            }
                            sx={{
                              textDecoration: 'none',
                              color: '#441da0',
                              '&:hover': {
                                opacity: 0.8
                              }
                            }}
                          >
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <FontAwesomeIcon icon={faEye} />
                              <Typography
                                sx={{ fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
                              >
                                Xem hồ sơ
                              </Typography>
                            </Stack>
                          </Link>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </RadioGroup>

              )}

            </Stack>

          </Grid>

          <Grid size={12}>

            <TextFieldCustom

              name="fullName"

              title="Họ và tên"

              showRequired={true}

              placeholder="Nhập họ và tên"

              control={control}

            />

          </Grid>

          <Grid size={12}>

            <TextFieldCustom

              name="email"

              title="Email"

              showRequired={true}

              placeholder="Nhập email"

              control={control}

            />

          </Grid>

          <Grid size={12}>

            <TextFieldCustom

              name="phone"

              title="Số điện thoại"

              showRequired={true}

              placeholder="Nhập số điện thoại"

              control={control}

            />

          </Grid>

          <Grid size={12}>

            <Typography color="GrayText" variant="caption">

              Lưu ý: Họ tên, email, số điện thoại cần chính xác để nhà tuyển

              dụng liên hệ với bạn.

            </Typography>

          </Grid>

        </Grid>

      </form>

    </>

  );

};

export default ApplyForm;
