import React from 'react';
import { Box, Skeleton, Stack, Typography } from '@mui/material';

const LanguageSkillCardLoading = () => (
  <Stack>
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Typography variant="h6" flex={1}>
          <Skeleton />
        </Typography>
        <Box>
          <Skeleton variant="circular" width={50} height={50} />
        </Box>
      </Stack>
    </Box>

    <Box sx={{ px: 1 }}>
      <Box sx={{ py: 2 }}>
        <Skeleton height={5} />
      </Box>
      {['language-skill-skeleton-1', 'language-skill-skeleton-2', 'language-skill-skeleton-3', 'language-skill-skeleton-4'].map((key) => (
        <Box sx={{ py: 0.5 }} key={key}>
          <Skeleton height={30} />
        </Box>
      ))}
    </Box>
  </Stack>
);

export default LanguageSkillCardLoading;
