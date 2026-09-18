'use client';
import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Container } from "@mui/material";

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/configs/constants';
import LanguageSwitcher from '@/layouts/components/commons/LanguageSwitcher';

const JobSeekerInterviewLoginPage = () => {
    const [sessionId, setSessionId] = useState('');
    const { push } = useRouter();
    const { t } = useTranslation(['candidate', 'common']);

    const handleJoin = () => {
        if (sessionId.trim()) {
            const targetRoute = ROUTES.JOBSEEKER_INTERVIEW.INTERVIEW_ROOM;
            push(`/${targetRoute.replace(':id', sessionId.trim())}`);
        }
    };

    return (
        <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0f172a', position: 'relative', py: 4 }}>
            <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1100 }}>
                <LanguageSwitcher />
            </Box>
            <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
                <Box sx={{ mt: { xs: 4, sm: 8 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Paper sx={{ p: { xs: 2.5, sm: 4 }, width: '100%', textAlign: 'center', borderRadius: { xs: 3, sm: 4 } }}>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                            {t('login.title')}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
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
                            sx={{ minHeight: 48, borderRadius: '12px', fontWeight: 700 }}
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
