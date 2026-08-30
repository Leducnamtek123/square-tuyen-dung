import React from 'react';
import { Box } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import { Button, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';

interface EmptyCardProps {
  content: string | React.ReactNode;
  labelButton?: string;
  onClick?: () => void;
}

const EmptyCard = ({ content, labelButton, onClick }: EmptyCardProps) => {
  const { t } = useTranslation('common');
  const resolvedLabel = labelButton || t('actions.addNew', 'Thêm mới');

  return (
    <Box
      sx={{
        p: { xs: 3.5, sm: 4.5 },
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        backgroundColor: '#F8FAFC',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: '#CBD5E1',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.05)',
        },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '12px',
          backgroundColor: '#EFF6FF',
          color: '#2563EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s ease',
          '&:hover': {
            transform: 'scale(1.08)',
          },
        }}
      >
        <AddIcon sx={{ fontSize: 24 }} />
      </Box>
      <Typography variant="body1" sx={{ color: '#475569', fontWeight: 500, fontSize: '0.925rem' }}>
        {content}
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onClick}
        sx={{
          backgroundColor: '#2563EB',
          color: '#FFFFFF',
          borderRadius: '10px',
          textTransform: 'none',
          fontWeight: 600,
          px: 2.5,
          py: 0.85,
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
          '&:hover': {
            backgroundColor: '#1D4ED8',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
          },
        }}
      >
        {resolvedLabel}
      </Button>
    </Box>
  );
};

export default EmptyCard;
