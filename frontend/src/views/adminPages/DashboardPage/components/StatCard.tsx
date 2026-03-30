import React from 'react';
import { Card, CardContent, Box, Typography, Skeleton, Stack } from "@mui/material";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface StatCardProps {
    title: string;
    value: number | string | undefined;
    icon: React.ReactNode;
    color: string;
    loading: boolean;
    trend?: number;
}

const StatCard = ({ title, value, icon, color, loading, trend }: StatCardProps) => (
    <Card
        sx={{
            height: '100%',
            background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
            borderLeft: '4px solid',
            borderColor: color,
            transition: 'all 0.3s ease',
            '&:hover': {
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                transform: 'translateY(-4px)',
            },
        }}
    >
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography color="textSecondary" variant="overline" sx={{ fontWeight: 600 }}>
                        {title}
                    </Typography>
                    {loading ? (
                        <Skeleton width={120} height={40} sx={{ mt: 1 }} />
                    ) : (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography color="textPrimary" variant="h4" sx={{ fontWeight: 700 }}>
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
                <Box sx={{ fontSize: '2.5rem', opacity: 0.8 }}>{icon}</Box>
            </Box>
        </CardContent>
    </Card>
);

export default StatCard;
