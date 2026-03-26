import * as React from 'react';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Card, Stack, Tab, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { Grid2 as Grid } from "@mui/material";
import { TabTitle } from '../../../utils/generalFunction';
import CompanyViewedCard from '../../components/jobSeekers/CompanyViewedCard';
import CompanyFollowedCard from '../../components/jobSeekers/CompanyFollowedCard';
import SuggestedJobPostCard from '../../components/defaults/SuggestedJobPostCard';

const MyCompanyPage = () => {
    const { t } = useTranslation('jobSeeker');
    TabTitle(t("myCompany.title"))
    const [value, setValue] = React.useState('1');

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    return (
        <Grid container spacing={2}>
            <Grid
                size={{
                    xs: 12,
                    sm: 12,
                    md: 7,
                    lg: 8,
                    xl: 8
                }}>
                <Stack spacing={2}>
                    <Card sx={{ p: 1 }}>
                        <Box sx={{ width: '100%', typography: 'body1' }}>
                            <TabContext value={value}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <TabList
                                        onChange={handleChange}
                                        aria-label={t("myCompany.aria.tabs")}
                                        variant="scrollable"
                                        allowScrollButtonsMobile
                                    >
                                        <Tab
                                            label={t("myCompany.tabs.viewed")}
                                            sx={{ textTransform: 'capitalize' }}
                                            value="1"
                                        />
                                        <Tab
                                            label={t("myCompany.tabs.followed")}
                                            sx={{ textTransform: 'capitalize' }}
                                            value="2"
                                        />
                                    </TabList>
                                </Box>
                                <TabPanel value="1" sx={{ px: { xs: 0, sm: 1, md: 2, lg: 2, xl: 2 } }}>
                                    {/* Start: CompanyViewedCard */}
                                    <CompanyViewedCard />
                                    {/* End: CompanyViewedCard */}
                                </TabPanel>
                                <TabPanel value="2" sx={{ px: { xs: 0, sm: 1, md: 2, lg: 2, xl: 2 } }}>
                                    {/* Start: CompanyFollowedCard */}
                                    <CompanyFollowedCard />
                                    {/* End: CompanyFollowedCard */}
                                </TabPanel>
                            </TabContext>
                        </Box>
                    </Card>
                </Stack>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    sm: 12,
                    md: 5,
                    lg: 4,
                    xl: 4
                }}>
                <Stack spacing={2}>
                    <Card sx={{ p: { xs: 1, sm: 1, md: 2, lg: 2, xl: 2 } }}>
                        <Stack>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="h6">{t("jobManagement.suitableJobs")}</Typography>
                            </Box>
                            <Box>
                                {/* Start: SuggestedJobPostCard */}
                                <SuggestedJobPostCard fullWidth={true} />
                                {/* End: SuggestedJobPostCardf */}
                            </Box>
                        </Stack>
                    </Card>
                </Stack>
            </Grid>
        </Grid>
    );
};

export default MyCompanyPage;
