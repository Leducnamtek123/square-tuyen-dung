import React from 'react';
import { Box, Typography } from '@mui/material';
import { type Theme } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import TimeAgo from '@/components/Common/TimeAgo';

type JobPostLargeFooterProps = {
  theme: Theme;
  deadline: string | Date;
};

export const JobPostLargeFooter = ({ theme, deadline }: JobPostLargeFooterProps) => (
  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.8,
        color: theme.palette.grey[600],
      }}
    >
      <FontAwesomeIcon
        icon={faClock}
        style={{ fontSize: '14px' }}
        color={theme.palette.grey[400]}
      />
      <Typography
        sx={{
          fontWeight: 500,
          fontSize: 13,
          color: theme.palette.grey[600],
        }}
        variant="body2"
      >
        Con <TimeAgo date={deadline} type="fromNow" />
      </Typography>
    </Box>
  </Box>
);
