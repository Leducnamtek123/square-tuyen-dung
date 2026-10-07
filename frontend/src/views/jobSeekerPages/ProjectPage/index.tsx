 'use client';
import * as React from "react";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Card, Paper, Stack, Tab, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { Grid2 as Grid } from "@mui/material";
import { TabTitle } from "@/utils/generalFunction";
import SavedJobCard from "@/views/components/jobSeekers/SavedJobCard";
import AppliedJobCard from "@/views/components/jobSeekers/AppliedJobCard";
import SuggestedJobPostCard from "@/views/components/defaults/SuggestedJobPostCard";
import JobPostNotificationCard from "@/views/components/jobSeekers/JobPostNotificationCard";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
const ProjectPage = () => {

    const { t } = useTranslation('jobSeeker');

    TabTitle(t("jobManagement.title"));

    const [value, setValue] = React.useState(() => {
        if (typeof window === 'undefined') return "1";
        return new URLSearchParams(window.location.search).get("tab") || "1";
    });

    const selectJobManagementTab = (event: React.SyntheticEvent, newValue: string) => {
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

                    <Paper
                        variant="outlined"
                        elevation={0}
                        sx={{
                            p: { xs: 1, sm: 1.5 },
                            borderRadius: '16px',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            boxShadow: 'none',
                        }}
                    >

                        <Box sx={{ width: "100%", typography: "body1" }}>

                            <TabContext value={value}>

                                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>

                                    <TabList

                                        onChange={selectJobManagementTab}

                                        aria-label={t("jobManagement.aria.tabs")}

                                        variant="scrollable"

                                        allowScrollButtonsMobile

                                    >

                                        <Tab

                                            label={t("jobManagement.tabs.saved")}

                                            sx={{ textTransform: "capitalize" }}

                                            value="1"

                                        />

                                        <Tab

                                            label={t("jobManagement.tabs.applied")}

                                            sx={{ textTransform: "capitalize" }}

                                            value="2"

                                        />

                                        <Tab

                                            label={t("jobManagement.tabs.notifications")}

                                            sx={{ textTransform: "capitalize" }}

                                            value="3"

                                        />

                                    </TabList>

                                </Box>

                                <TabPanel

                                    value="1"

                                    sx={{ px: { xs: 0, sm: 1, md: 2, lg: 2, xl: 2 } }}

                                >

                                    {/* Start: SavedJobCard */}

                                    <SavedJobCard />

                                    {/* End: SavedJobCard */}

                                    <Box mt={1}>

                                        <Typography color="gray" variant="caption">

                                            {t("jobManagement.notes.expired")}

                                        </Typography>

                                    </Box>

                                </TabPanel>

                                <TabPanel

                                    value="2"

                                    sx={{ px: { xs: 0, sm: 1, md: 2, lg: 2, xl: 2 } }}

                                >

                                    {/* Start: AppliedJobCard */}

                                    <AppliedJobCard />

                                    {/* End: AppliedJobCard */}

                                </TabPanel>

                                <TabPanel value="3" sx={{ p: 0 }}>

                                    {/* Start: JobPostNotificationCard */}

                                    <JobPostNotificationCard />

                                    {/* End: JobPostNotificationCard */}

                                </TabPanel>

                            </TabContext>

                        </Box>

                    </Paper>

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

                    <Card
                        elevation={0}
                        sx={{
                            p: { xs: 1.5, sm: 2 },
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                            bgcolor: '#ffffff',
                            boxShadow: '0 2px 12px -2px rgba(0,0,0,0.03)',
                        }}
                    >
                        <Stack>
                            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '8px',
                                        bgcolor: '#eff6ff',
                                        color: '#2563eb',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    <AutoAwesomeIcon sx={{ fontSize: 18 }} />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                        {t("jobManagement.suitableJobs")}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                                        Gợi ý việc làm liên quan cho bạn
                                    </Typography>
                                </Box>
                            </Box>

                            <Box>
                                <SuggestedJobPostCard fullWidth={true} pageSize={5} />
                            </Box>
                        </Stack>
                    </Card>

                </Stack>

            </Grid>

        </Grid>

    );

};

export default ProjectPage;
