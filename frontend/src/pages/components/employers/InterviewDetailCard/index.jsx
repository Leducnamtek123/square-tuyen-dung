/*

MyJob Recruitment System - Part of MyJob Platform



Author: Bui Khanh Huy

Email: khuy220@gmail.com

Copyright (c) 2023 Bui Khanh Huy



License: MIT License

See the LICENSE file in the project root for full license information.

*/



import React, { useState, useEffect } from 'react';

import {

    Box,

    Typography,

    Paper,

    Grid,

    Divider,

    Chip,

    Button,

    CircularProgress,

    Stack,

    IconButton

} from '@mui/material';

import { useParams, useNavigate } from 'react-router-dom';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';



import interviewService from '../../../../services/interviewService';

import { transformInterviewSession } from '../../../../utils/transformers';



const InterviewDetailCard = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const [session, setSession] = useState(null);

    const [loading, setLoading] = useState(true);



    const fetchDetail = async () => {

        try {

            const res = await interviewService.getSessionDetail(id);

            setSession(transformInterviewSession(res));

        } catch (error) {

            console.error('Error fetching session detail', error);

        } finally {

            setLoading(false);

        }

    };



    useEffect(() => {

        fetchDetail();



        // Polling every 5 seconds if session is active

        let interval;

        if (session?.status === 'in_progress') {

            interval = setInterval(fetchDetail, 5000);

        }



        return () => clearInterval(interval);

    }, [id, session?.status]);



    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress /></Box>;

    if (!session) return (

        <Box sx={{ textAlign: 'center', py: 5 }}>

            <Typography color="text.secondary">Không tìm thấy thông tin buổi phỏng vấn</Typography>

            <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Quay lại</Button>

        </Box>

    );



    const getStatusColor = (status) => {

        switch (status) {

            case 'completed': return 'success';

            case 'in_progress': return 'primary';

            case 'cancelled': return 'error';

            default: return 'warning';

        }

    };



    return (

        <Box sx={{

            px: { xs: 1, sm: 2 },

            py: { xs: 2, sm: 2 },

            backgroundColor: 'background.paper',

            borderRadius: 2

        }}>

            <Button

                startIcon={<ArrowBackIcon />}

                onClick={() => navigate(-1)}

                sx={{ mb: 3, color: 'text.secondary', fontWeight: 500 }}

            >

                Quay lại danh sách

            </Button>



            <Stack

                direction={{ xs: 'column', sm: 'row' }}

                justifyContent="space-between"

                alignItems={{ xs: 'flex-start', sm: 'flex-start' }}

                spacing={2}

                mb={4}

            >

                <Box>

                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>

                        Chi tiết buổi Phỏng vấn trực tuyến

                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>

                        Mã phòng: <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>{session.room_name}</Box> | ID: {session.id}

                    </Typography>

                </Box>

                <Chip

                    label={session.status?.replaceAll('_', ' ')?.toUpperCase()}

                    color={getStatusColor(session.status)}

                    sx={{

                        fontWeight: 700,

                        px: 1,

                        borderRadius: 1.5,

                        boxShadow: (theme) => theme.customShadows?.z1 || 1

                    }}

                />

            </Stack>



            <Grid container spacing={3}>

                {/* Left Column: Info & Evaluation */}

                <Grid item xs={12} md={4}>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                        <Paper sx={{

                            p: 3,

                            borderRadius: 3,

                            border: '1px solid',

                            borderColor: 'divider',

                            boxShadow: (theme) => theme.customShadows?.card || 1

                        }}>

                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>Thông tin buổi phỏng vấn</Typography>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                                <Box>

                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>ỨNG VIÊN</Typography>

                                    <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>{session.candidateName}</Typography>

                                    <Typography variant="body2" color="text.secondary">{session.candidate_email}</Typography>

                                </Box>

                                <Box>

                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>VỊ TRÍ</Typography>

                                    <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>{session.jobName || 'N/A'}</Typography>

                                </Box>

                                <Box>

                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>LOẠI PH?NG V?N</Typography>

                                    <Typography variant="body1" sx={{ mt: 0.5 }}>{session.type?.toUpperCase()}</Typography>

                                </Box>

                                <Box>

                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>LỊCH HẸN</Typography>

                                    <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>{new Date(session.scheduledAt).toLocaleString('vi-VN')}</Typography>

                                </Box>

                            </Box>

                        </Paper>



                        <Paper sx={{

                            p: 3,

                            borderRadius: 3,

                            background: (theme) => `linear-gradient(135deg, ${theme.palette.background.neutral || '#f4f6f8'} 0%, ${theme.palette.background.paper} 100%)`,

                            border: '1px solid',

                            borderColor: 'divider',

                            boxShadow: (theme) => theme.customShadows?.card || 1

                        }}>

                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>Kết quả đánh giá AI</Typography>

                            {session.ai_overall_score ? (

                                <Box sx={{ textAlign: 'center', py: 2 }}>

                                    <Typography variant="h2" color="primary" sx={{ fontWeight: 800 }}>

                                        {session.ai_overall_score}<Box component="span" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>/10</Box>

                                    </Typography>

                                    <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 500, color: 'text.secondary' }}>

                                        {session.ai_summary || '?? c? k?t qu? đánh giá tổng quát t? hệ thống AI'}

                                    </Typography>

                                    <Button

                                        variant="contained"

                                        fullWidth

                                        sx={{

                                            mt: 3,

                                            borderRadius: 2,

                                            background: (theme) => theme.palette.primary.gradient,

                                            boxShadow: (theme) => theme.customShadows?.primary || 1

                                        }}

                                    >

                                        Xem chi ti?t báo cáo

                                    </Button>

                                </Box>

                            ) : (

                                <Box sx={{ py: 4, textAlign: 'center' }}>

                                    <CircularProgress size={28} sx={{ mb: 2 }} />

                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>

                                        {session.status === 'completed' ? 'AI đang phân tích hội thoại...' : 'Phỏng vấn chưa kết thúc'}

                                    </Typography>

                                </Box>

                            )}

                        </Paper>

                    </Box>

                </Grid>



                {/* Right Column: Transcript */}

                <Grid item xs={12} md={8}>

                    <Paper sx={{

                        p: 0,

                        overflow: 'hidden',

                        height: { xs: '60vh', md: '75vh' },

                        display: 'flex',

                        flexDirection: 'column',

                        borderRadius: 3,

                        border: '1px solid',

                        borderColor: 'divider',

                        boxShadow: (theme) => theme.customShadows?.card || 1

                    }}>

                        <Box sx={{

                            p: 2.5,

                            borderBottom: '1px solid',

                            borderColor: 'divider',

                            bgcolor: 'background.neutral',

                            display: 'flex',

                            justifyContent: 'space-between',

                            alignItems: 'center'

                        }}>

                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Lịch sử hội thoại</Typography>

                            {session.status === 'in_progress' && (

                                <Stack direction="row" spacing={1} alignItems="center">

                                    <Box sx={{

                                        width: 8,

                                        height: 8,

                                        bgcolor: 'error.main',

                                        borderRadius: '50%',

                                        animation: 'pulse 1.5s infinite'

                                    }} />

                                    <Typography variant="caption" color="error" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>LIVE MONITORING</Typography>

                                </Stack>

                            )}

                        </Box>



                        <Box sx={{

                            flex: 1,

                            overflowY: 'auto',

                            p: { xs: 2, sm: 3 },

                            display: 'flex',

                            flexDirection: 'column',

                            gap: 2.5,

                            bgcolor: 'background.paper',

                            '&::-webkit-scrollbar': { width: 6 },

                            '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 }

                        }}>

                            {session.transcripts && session.transcripts.length > 0 ? session.transcripts.map((t, index) => (

                                <Box key={index} sx={{

                                    alignSelf: t.speaker_role === 'ai_agent' ? 'flex-start' : 'flex-end',

                                    maxWidth: { xs: '90%', sm: '80%' }

                                }}>

                                    <Box sx={{

                                        p: 2,

                                        borderRadius: 2,

                                        bgcolor: t.speaker_role === 'ai_agent' ? 'background.neutral' : 'primary.main',

                                        color: t.speaker_role === 'ai_agent' ? 'text.primary' : 'primary.contrastText',

                                        position: 'relative',

                                        boxShadow: (theme) => t.speaker_role === 'ai_agent' ? 'none' : theme.customShadows?.z1

                                    }}>

                                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{t.content}</Typography>

                                    </Box>

                                    <Typography variant="caption" sx={{

                                        mt: 0.75,

                                        display: 'block',

                                        textAlign: t.speaker_role === 'ai_agent' ? 'left' : 'right',

                                        color: 'text.secondary',

                                        opacity: 0.8,

                                        fontWeight: 500

                                    }}>

                                        {t.speaker_role === 'ai_agent' ? 'AI Interviewer' : 'ứng viên'} ? {new Date(t.create_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}

                                    </Typography>

                                </Box>

                            )) : (

                                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>

                                    <Stack alignItems="center" spacing={1}>

                                        <Typography variant="body2">Chưa có dữ liệu hội thoại</Typography>

                                    </Stack>

                                </Box>

                            )}

                        </Box>

                    </Paper>

                </Grid>

            </Grid>



            <style dangerouslySetInnerHTML={{

                __html: `

                @keyframes pulse {

                    0% { transform: scale(1); opacity: 1; }

                    50% { transform: scale(1.5); opacity: 0.5; }

                    100% { transform: scale(1); opacity: 1; }

                }

            `}} />

        </Box>

    );

};



export default InterviewDetailCard;

