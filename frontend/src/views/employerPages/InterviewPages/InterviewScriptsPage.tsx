'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import InterviewScriptsManager from '@/views/components/employers/InterviewScripts';

export const InterviewScriptsPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 }, px: { xs: 2, sm: 3 } }}>
      <InterviewScriptsManager />
    </Container>
  );
};

export default InterviewScriptsPage;
