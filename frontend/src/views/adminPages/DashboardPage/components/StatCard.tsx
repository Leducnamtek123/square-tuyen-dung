import React from 'react';
import { Card, CardContent, Box, Typography, Skeleton, Stack, LinearProgress } from "@mui/material";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { rgba } from '@/components/Common/Charts/chartDesign';

interface StatCardProps {
    title: string;
    value: number | string | undefined;
    icon: React.ReactNode;
    color: string;
    loading: boolean;
    trend?: number;
    helper?: React.ReactNode;
    footerLabel?: string;
    footerValue?: React.ReactNode;
    progress?: number;
}

const clampProgress = (value?: number) => Math.min(100, Math.max(0, Number(value ?? 0)));

const StatCard = ({ title, value, icon, color, loading, trend, helper, footerLabel, footerValue, progress }: StatCardProps) => (
    <Card
        elevation={0}
        sx={{
            height: '100%',
            borderRadius: '14px',
            border: '1px solid #E5E7EB',
            background: '#FFFFFF',
            boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.04), 0px 1px 2px -1px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            position: 'relative',
            transition: 'box-shadow 100ms ease-in-out, border-color 100ms ease-in-out, transform 100ms ease-in-out',
            '&:hover': {
                borderColor: '#D1D5DB',
                boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.06)',
                transform: 'translateY(-1px)',
            },
        }}
    >
        <CardContent sx={{ p: 2.5 }}>
            <Stack spacing={1.75}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="overline"
                            sx={{
                                display: 'block',
                                color: 'text.secondary',
                                fontWeight: 800,
                                letterSpacing: 0,
                                lineHeight: 1.35,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {title}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            flex: '0 0 auto',
                            borderRadius: 2,
                            display: 'grid',
                            placeItems: 'center',
                            color,
                            bgcolor: rgba(color, 0.12),
                            '& svg': { fontSize: 24 },
                        }}
                    >
                        {icon}
                    </Box>
                </Box>
                <Box>
                    {loading ? (
                        <Skeleton width={132} height={48} />
                    ) : (
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ minHeight: 48 }}>
                            <Typography color="textPrimary" variant="h4" sx={{ fontWeight: 850, letterSpacing: 0, lineHeight: 1.1 }}>
                                {value?.toLocaleString() || 0}
                            </Typography>
                            {trend && (
                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                                    <TrendingUpIcon fontSize="small" />
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                        {trend}%
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    )}
                </Box>
                {helper ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 650, minHeight: 22 }}>
                        {helper}
                    </Typography>
                ) : null}
                {progress !== undefined ? (
                    <LinearProgress
                        variant="determinate"
                        value={clampProgress(progress)}
                        sx={{
                            height: 7,
                            borderRadius: 999,
                            bgcolor: rgba(color, 0.12),
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 999,
                                bgcolor: color,
                            },
                        }}
                    />
                ) : null}
                {footerLabel || footerValue ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 750 }}>
                            {footerLabel}
                        </Typography>
                        <Typography variant="caption" sx={{ color, fontWeight: 850 }}>
                            {footerValue}
                        </Typography>
                    </Box>
                ) : null}
            </Stack>
        </CardContent>
    </Card>
);

export default StatCard;
