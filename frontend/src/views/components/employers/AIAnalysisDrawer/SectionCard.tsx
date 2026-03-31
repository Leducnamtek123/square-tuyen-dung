import React from 'react';
import { Paper, Stack, Box, Typography, alpha, useTheme, Theme } from '@mui/material';

export const SectionCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  iconColor?: string;
}> = ({ title, icon, children, iconColor }) => {
  const theme = useTheme();
  const defaultIconColor = theme.palette.primary.main;
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 2,
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.8),
        borderRadius: 3,
        bgcolor: 'background.paper',
        transition: 'all 0.2s ease-in-out',
        '&:hover': { 
            borderColor: theme.palette.primary.main,
            boxShadow: (theme: Theme) => theme.customShadows?.z1
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <Box sx={{ 
            color: iconColor || defaultIconColor, 
            display: 'flex',
            p: 0.75,
            borderRadius: 1,
            bgcolor: alpha(iconColor || defaultIconColor, 0.08)
        }}>
            {icon}
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem' }}>
          {title}
        </Typography>
      </Stack>
      <Box sx={{ px: 0.5 }}>
        {children}
      </Box>
    </Paper>
  );
};
