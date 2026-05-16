'use client';
import React from 'react';
import { Box, Tab } from "@mui/material";
import { TabTitle } from '../../../utils/generalFunction';
import CompanyCard from '../../components/employers/CompanyCard';
import CompanyImageCard from '../../components/employers/CompanyImageCard';
import CompanyTeamCard from '../../components/employers/CompanyTeamCard';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useTranslation } from 'react-i18next';

const CompanyPage = () => {
    const { t } = useTranslation('employer');
    TabTitle(t("company.title"));
    const [value, setValue] = React.useState('0');

    const selectCompanyTab = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    return (
        <Box
            sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                boxShadow: (theme) => theme.customShadows?.z1,
            }}
        >
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList
                        onChange={selectCompanyTab}
                        aria-label="company tabs"
                        sx={{
                            minHeight: 44,
                            '& .MuiTabs-indicator': {
                                height: 3,
                                borderRadius: 3,
                            },
                            '& .MuiTab-root': {
                                minHeight: 44,
                                px: { xs: 1.5, sm: 2.5 },
                                fontSize: '0.875rem',
                                fontWeight: 800,
                                letterSpacing: 0,
                                textTransform: 'none',
                            },
                        }}
                    >
                        <Tab label={t("company.tabs.info")} value="0" />
                        <Tab label={t("company.tabs.multimedia")} value="1" />
                        <Tab label={t("company.tabs.team", "Team")} value="2" />
                    </TabList>
                </Box>
                <TabPanel value="0" sx={{ px: 0, pt: 3, pb: 0 }}>
                    {/* Start: Company card */}
                    <CompanyCard />
                    {/* End: Company card */}
                </TabPanel>
                <TabPanel value="1" sx={{ px: 0, pt: 3, pb: 0 }}>
                    {/* Start: Company image card */}
                    <CompanyImageCard />
                    {/* End: Company image card */}
                </TabPanel>
                <TabPanel value="2" sx={{ px: 0, pt: 3, pb: 0 }}>
                    <CompanyTeamCard />
                </TabPanel>
            </TabContext>
        </Box>
    );
};

export default CompanyPage;
