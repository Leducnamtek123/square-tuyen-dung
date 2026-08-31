'use client';

import React from "react";
import { Box, Card, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { Grid2 as Grid } from "@mui/material";
import PersonPinOutlinedIcon from "@mui/icons-material/PersonPinOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { TabTitle } from "@/utils/generalFunction";
import PersonalInfoCard from "@/views/components/jobSeekers/PersonalInfoCard";
import GeneralInfoCard from "@/views/components/jobSeekers/GeneralInfoCard";
import CVCard from "@/views/components/jobSeekers/CVCard";

const AttachedProfilePage = () => {
    const { t } = useTranslation('jobSeeker');
    TabTitle(t("attachedProfile.pageTitle"));

    const refs = React.useRef<(HTMLElement | null)[]>([]);
    const [activeSection, setActiveSection] = React.useState<number>(0);

    const items = [
        { id: 0, value: t('attachedProfile.sections.personal'), icon: <PersonPinOutlinedIcon /> },
        { id: 1, value: t('attachedProfile.sections.general'), icon: <WorkOutlineOutlinedIcon /> },
        { id: 2, value: t('attachedProfile.sections.cv'), icon: <UploadFileOutlinedIcon /> },
    ];

    React.useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-15% 0px -60% 0px',
            threshold: 0,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const idx = refs.current.findIndex((el) => el === entry.target);
                    if (idx !== -1) {
                        setActiveSection(idx);
                    }
                }
            });
        }, observerOptions);

        refs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    const handleClickScroll = (index: number) => {
        setActiveSection(index);
        refs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    return (
        <Box sx={{ py: 2, px: { xs: 2, sm: 3 } }}>
            {/* Mobile Section Quick Jump Bar */}
            <Box
                sx={{
                    display: { xs: 'flex', md: 'none' },
                    overflowX: 'auto',
                    gap: 1,
                    pb: 1.5,
                    mb: 1.5,
                    WebkitOverflowScrolling: 'touch',
                    '&::-webkit-scrollbar': { display: 'none' },
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                }}
            >
                {items.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                        <Box
                            key={item.id}
                            onClick={() => handleClickScroll(item.id)}
                            sx={{
                                px: 2,
                                py: 0.75,
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: isActive ? 700 : 500,
                                color: isActive ? '#ffffff' : 'text.primary',
                                backgroundColor: isActive ? 'primary.main' : 'background.paper',
                                border: '1px solid',
                                borderColor: isActive ? 'primary.main' : 'divider',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                flexShrink: 0,
                                transition: 'all 0.2s ease',
                                boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none',
                            }}
                        >
                            {item.value}
                        </Box>
                    );
                })}
            </Box>

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
                            ref={(el) => { refs.current[0] = el; }}
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

                        <Card
                            ref={(el) => { refs.current[1] = el; }}
                            sx={{
                                '&:hover': {
                                    boxShadow: (theme) => theme.customShadows.card,
                                    borderColor: 'primary.main',
                                    transition: 'all 0.3s ease'
                                }
                            }}
                        >
                            {/* Start: General info */}
                            <GeneralInfoCard title={t('attachedProfile.sections.general')} />
                            {/* End: General info */}
                        </Card>

                        <Card
                            ref={(el) => { refs.current[2] = el; }}
                            sx={{
                                '&:hover': {
                                    boxShadow: (theme) => theme.customShadows.card,
                                    borderColor: 'primary.main',
                                    transition: 'all 0.3s ease'
                                }
                            }}
                        >
                            {/* Start: Cv card */}
                            <CVCard title={t('attachedProfile.sections.cv')} />
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
                                background: (theme) => theme.palette.primary.main,
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
                                    {t('attachedProfile.sidebar.title')}
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
                                                selected={activeSection === item.id}
                                                sx={{
                                                    borderRadius: 2,
                                                    bgcolor: activeSection === item.id ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                                    },
                                                    '&.Mui-selected': {
                                                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                                        },
                                                    },
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
                                                            fontWeight: activeSection === item.id ? 700 : 500
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
