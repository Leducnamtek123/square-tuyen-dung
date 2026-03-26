import React from "react";
import Link from 'next/link';
import { Box, Card, Divider, Stack, Typography, Button } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { Grid2 as Grid } from "@mui/material";
import { TabTitle } from "../../../utils/generalFunction";
import { APP_NAME, ROUTES } from "../../../configs/constants";
import BoxProfile from "../../components/jobSeekers/BoxProfile";
import ProfileUpload from "../../components/jobSeekers/ProfileUpload";
import CompanyViewedCard from "../../components/jobSeekers/CompanyViewedCard";

const ProfilePage = () => {

    const { t } = useTranslation(['jobSeeker', 'common']);

    TabTitle(t('jobSeeker:profile.title'));

    return (

        <Box>

            <Grid container spacing={2}>

                <Grid

                    size={{

                        xs: 12,

                        sm: 12,

                        md: 12,

                        lg: 8,

                        xl: 8

                    }}>

                    <Stack spacing={2}>

                        <Card sx={{ p: { xs: 2, sm: 2, md: 2, lg: 3, xl: 3 } }}>

                            {/* Start: Box profile */}

                            <BoxProfile title={t('jobSeeker:profile.appProfile', { appName: APP_NAME })} />

                            {/* End: Box profile  */}

                        </Card>

                        <Card sx={{ p: { xs: 2, sm: 2, md: 2, lg: 3, xl: 3 } }}>

                            {/* Start: Profile upload */}

                            <ProfileUpload title={t('jobSeeker:profile.attachedResumes')} />

                            {/* End: Profile upload */}

                        </Card>

                    </Stack>

                </Grid>

                <Grid

                    size={{

                        xs: 12,

                        sm: 12,

                        md: 12,

                        lg: 4,

                        xl: 4

                    }}>

                    <Stack spacing={2}>

                        <Card sx={{ p: { xs: 1, sm: 1, md: 2, lg: 2, xl: 2 } }}>

                            <Stack>

                                <Box>

                                    <Typography variant="h5">{t('jobSeeker:profile.whoViewed')}</Typography>

                                </Box>

                                <Divider sx={{ mt: 1, mb: 2, borderColor: "grey.500" }} />

                                <Box>

                                    {/* Start: CompanyViewedCard */}

                                    <CompanyViewedCard />

                                    {/* End: CompanyViewedCard */}

                                </Box>

                                <Stack direction="row" justifyContent="center">

                                    <Button

                                        sx={{ textTransform: "inherit" }}

                                        variant="text"

                                        color="primary"

                                        component={Link}

                                        href={`/${ROUTES.JOB_SEEKER.MY_COMPANY}`}

                                    >

                                        {t('common:viewDetails')}

                                    </Button>

                                </Stack>

                            </Stack>

                        </Card>

                    </Stack>

                </Grid>

            </Grid>

        </Box>

    );

};

export default ProfilePage;
