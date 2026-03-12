/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import React from "react";

import { Box, Card, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import Grid from "@mui/material/Grid2";

import PersonPinOutlinedIcon from "@mui/icons-material/PersonPinOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";

import { TabTitle } from "../../../utils/generalFunction";
import PersonalInfoCard from "../../components/jobSeekers/PersonalInfoCard";
import GeneralInfoCard from "../../components/jobSeekers/GeneralInfoCard";
import CVCard from "../../components/jobSeekers/CVCard";



const AttachedProfilePage = () => {
    const { t } = useTranslation('jobSeeker');
    TabTitle(t("attachedProfile.title"));
    const refs = React.useRef([]);

    const items = [
        { id: 0, value: t('attachedProfile.sections.personal'), icon: <PersonPinOutlinedIcon /> },
        { id: 1, value: t('attachedProfile.sections.general'), icon: <WorkOutlineOutlinedIcon /> },
        { id: 2, value: t('attachedProfile.sections.upload'), icon: <UploadFileOutlinedIcon /> },
    ];

    const handleClickScroll = (index) => {
        refs.current[index].scrollIntoView({ behavior: "smooth", block: "center" });
    };

    return (
        <Box sx={{ py: 2, px: { xs: 2, sm: 3 } }}>
            <Grid container spacing={3}>
                <Grid
                    size={{
                        xs: 12,
                        sm: 12,
                        md: 7,
                        lg: 9,
                        xl: 9
                    }}>
                    <Stack spacing={3}>
                        <Card
                            ref={(el) => (refs.current[0] = el)}
                            sx={{
                                '&:hover': {
                                    boxShadow: (theme) => theme.customShadows.card,
                                    borderColor: 'primary.main',
                                    transition: 'all 0.3s ease'
                                }
                            }}
                        >
                            {/* Start: Personal info */}
                            <PersonalInfoCard title={t('attachedProfile.sections.personal')} />
                            {/* End: Personal info  */}
                        </Card>
                        <Card ref={(el) => (refs.current[1] = el)}>
                            {/* Start: General info */}
                            <GeneralInfoCard title={t('attachedProfile.sections.general')} />
                            {/* End: General info */}
                        </Card>
                        <Card ref={(el) => (refs.current[2] = el)}>
                            {/* Start: Cv card */}
                            <CVCard title={t('attachedProfile.sections.upload')} />
                            {/* End: Cv card */}
                        </Card>
                    </Stack>
                </Grid>
                <Grid
                    sx={{
                        display: {
                            xs: 'none',
                            sm: 'none',
                            md: 'block'
                        }
                    }}
                    size={{
                        xs: 12,
                        sm: 12,
                        md: 5,
                        lg: 3,
                        xl: 3
                    }}>
                    <Stack
                        spacing={2}
                        sx={{
                            position: 'sticky',
                            top: 80,
                        }}
                    >
                        <Card
                            sx={{
                                p: 3,
                                background: (theme) => theme.palette.primary.gradient,
                                color: 'white',
                                border: 'none'
                            }}
                        >
                            <Stack spacing={2}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'inherit'
                                    }}
                                >
                                    {t('attachedProfile.sidebarTitle')}
                                </Typography>

                                <List sx={{ width: '100%' }}>
                                    {items.map((item) => (
                                        <ListItem
                                            key={item.id}
                                            disablePadding
                                            sx={{ mb: 1 }}
                                        >
                                            <ListItemButton
                                                onClick={() => handleClickScroll(item.id)}
                                                sx={{
                                                    borderRadius: 2,
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                    }
                                                }}
                                            >
                                                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                                                    {item.icon}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={item.value}
                                                    slotProps={{
                                                        primary: {
                                                            fontSize: '0.9rem',
                                                            fontWeight: 500
                                                        }
                                                    }}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </Stack>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AttachedProfilePage;
