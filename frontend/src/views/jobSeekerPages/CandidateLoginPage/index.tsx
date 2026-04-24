'use client';
import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Container } from "@mui/material";

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../../configs/constants';
import LanguageSwitcher from '../../../layouts/components/commons/LanguageSwitcher';

const JobSeekerInterviewLoginPage = () => {
    const [sessionId, setSessionId] = useState('');
    const navigate = useRouter();
    const { t } = useTranslation(['candidate', 'common']);

    const handleJoin = () => {
        if (sessionId.trim()) {
            const targetRoute = ROUTES.JOBSEEKER_INTERVIEW.INTERVIEW_ROOM;
            navigate.push(`/${targetRoute.replace(':id', sessionId.trim())}`);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0f172a', position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1100 }}>
                <LanguageSwitcher />
            </Box>
            <Container maxWidth="sm">
                <Box sx={{ mt: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Paper sx={{ p: 4, width: '100%', textAlign: 'center' }}>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                            {t('login.title')}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                            {t('login.body')}
                        </Typography>
    
                        <TextField
                            fullWidth
                            label={t('login.label')}
                            variant="outlined"
                            value={sessionId}
                            onChange={(e) => setSessionId(e.target.value)}
                            sx={{ mb: 3 }}
                        />
    
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={handleJoin}
                            disabled={!sessionId.trim()}
                        >
                            {t('common:actions.joinNow')}
                        </Button>
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
};

export default JobSeekerInterviewLoginPage;
