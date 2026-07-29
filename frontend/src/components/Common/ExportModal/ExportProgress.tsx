import React from 'react';
import { Box, Typography, LinearProgress, Stack, Paper, CircularProgress } from '@mui/material';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import type { ExportFormat } from './types';

interface ExportProgressProps {
  progress: number;
  stepText: string;
  format: ExportFormat;
  fileName: string;
}

export const ExportProgress: React.FC<ExportProgressProps> = ({
  progress,
  stepText,
  format,
  fileName,
}) => {
  return (
    <Box
      sx={{
        py: 6,
        px: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 340,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: 480,
          width: '100%',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
          textAlign: 'center',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
          <CircularProgress
            variant="determinate"
            value={progress}
            size={72}
            thickness={4}
            sx={{ color: '#2563EB' }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <InsertDriveFileOutlinedIcon sx={{ fontSize: 30, color: '#2563EB' }} />
          </Box>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 0.5, fontSize: '1.125rem' }}>
          Preparing file...
        </Typography>

        <Typography variant="body2" sx={{ color: '#6B7280', mb: 3, fontSize: '0.875rem' }}>
          Đang tạo file <strong style={{ color: '#111827' }}>{fileName}</strong> ({format.toUpperCase()})
        </Typography>

        {/* Progress Bar Container */}
        <Box sx={{ width: '100%', mb: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: '#F3F4F6',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                backgroundColor: '#2563EB',
                transition: 'transform 200ms linear',
              },
            }}
          />
        </Box>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500, fontSize: '0.8125rem' }}>
            {stepText || 'Generating Excel...'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700, fontSize: '0.8125rem' }}>
            {progress}%
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};
