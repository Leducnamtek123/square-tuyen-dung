 'use client';
import React from 'react';
import { Box, Card, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { Grid2 as Grid } from "@mui/material";
import PersonPinOutlinedIcon from '@mui/icons-material/PersonPinOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import { TabTitle } from '../../../utils/generalFunction';
import PersonalInfoCard from '../../components/jobSeekers/PersonalInfoCard';
import GeneralInfoCard from '../../components/jobSeekers/GeneralInfoCard';
import ExperienceDetailCard from '../../components/jobSeekers/ExperienceDetailCard';
import EducationDetailCard from '../../components/jobSeekers/EducationDetailCard';
import CertificateCard from '../../components/jobSeekers/CertificateCard';
import LanguageSkillCard from '../../components/jobSeekers/LanguageSkillCard';
import AdvancedSkillCard from '../../components/jobSeekers/AdvancedSkillCard';
import usePreventUnsavedChanges from '../../../hooks/usePreventUnsavedChanges';

const OnlineProfilePage = () => {
    const { t } = useTranslation('jobSeeker');
    TabTitle(t("onlineProfile.pageTitle"));

    const [isDirty, setIsDirty] = React.useState(false);
    usePreventUnsavedChanges(isDirty);

    const refs = React.useRef<(HTMLElement | null)[]>([]);
    const [activeSection, setActiveSection] = React.useState<number>(0);

    const items = [
        { id: 0, value: t('onlineProfile.sections.personal'), icon: <PersonPinOutlinedIcon /> },
        { id: 1, value: t('onlineProfile.sections.general'), icon: <WorkOutlineOutlinedIcon /> },
        { id: 2, value: t('onlineProfile.sections.experience'), icon: <ReceiptLongOutlinedIcon /> },
        { id: 3, value: t('onlineProfile.sections.education'), icon: <SchoolOutlinedIcon /> },
        { id: 4, value: t('onlineProfile.sections.certificates'), icon: <CardMembershipOutlinedIcon /> },
        { id: 5, value: t('onlineProfile.sections.language'), icon: <TranslateOutlinedIcon /> },
        { id: 6, value: t('onlineProfile.sections.advanced'), icon: <AutoFixHighOutlinedIcon /> },
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
        refs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
                            <PersonalInfoCard title={t('onlineProfile.sections.personal')} />
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
                            <GeneralInfoCard title={t('onlineProfile.sections.general')} />
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
                            <ExperienceDetailCard title={t('onlineProfile.sections.experience')} />
                        </Card>

                        <Card
                            ref={(el) => { refs.current[3] = el; }}
                            sx={{
                                '&:hover': {
                                    boxShadow: (theme) => theme.customShadows.card,
                                    borderColor: 'primary.main',
                                    transition: 'all 0.3s ease'
                                }
                            }}
                        >
                            <EducationDetailCard title={t('onlineProfile.sections.education')} />
                        </Card>

                        <Card
                            ref={(el) => { refs.current[4] = el; }}
                            sx={{
                                '&:hover': {
                                    boxShadow: (theme) => theme.customShadows.card,
                                    borderColor: 'primary.main',
                                    transition: 'all 0.3s ease'
                                }
                            }}
                        >
                            <CertificateCard title={t('onlineProfile.sections.certificates')} />
                        </Card>

                        <Card
                            ref={(el) => { refs.current[5] = el; }}
                            sx={{
                                '&:hover': {
                                    boxShadow: (theme) => theme.customShadows.card,
                                    borderColor: 'primary.main',
                                    transition: 'all 0.3s ease'
                                }
                            }}
                        >
                            <LanguageSkillCard title={t('onlineProfile.sections.language')} />
                        </Card>

                        <Card
                            ref={(el) => { refs.current[6] = el; }}
                            sx={{
                                '&:hover': {
                                    boxShadow: (theme) => theme.customShadows.card,
                                    borderColor: 'primary.main',
                                    transition: 'all 0.3s ease'
                                }
                            }}
                        >
                            <AdvancedSkillCard title={t('onlineProfile.sections.advanced')} />
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
                                border: 'none',
                                borderRadius: '16px',
                                boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.25)',
                            }}
                        >
                            <Stack spacing={2}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 700,
                                        color: 'inherit',
                                        fontSize: '1rem',
                                        letterSpacing: '-0.01em',
                                    }}
                                >
                                    {t('onlineProfile.sidebar.title')}
                                </Typography>

                                <List sx={{ width: '100%', p: 0 }}>
                                    {items.map((item) => {
                                        const isSelected = activeSection === item.id;
                                        return (
                                            <ListItem
                                                key={item.id}
                                                disablePadding
                                                sx={{ mb: 0.75 }}
                                            >
                                                <ListItemButton
                                                    onClick={() => handleClickScroll(item.id)}
                                                    sx={{
                                                        borderRadius: 2,
                                                        py: 1,
                                                        px: 1.5,
                                                        backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.24)' : 'transparent',
                                                        boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                                                        border: isSelected ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                                                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                                        '&:hover': {
                                                            backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.12)',
                                                        }
                                                    }}
                                                >
                                                    <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                                                        {item.icon}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={item.value}
                                                        slotProps={{
                                                            primary: {
                                                                fontSize: '0.875rem',
                                                                fontWeight: isSelected ? 700 : 500,
                                                            }
                                                        }}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            </Stack>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default OnlineProfilePage;
