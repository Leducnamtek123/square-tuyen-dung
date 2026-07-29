import React from 'react';
import { Box } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import { Button, Typography } from "@mui/material";

interface EmptyCardProps {
  content: string | React.ReactNode;
  labelButton?: string;
  onClick?: () => void;
}

const EmptyCard = ({ content, labelButton="Thêm mới", onClick }: EmptyCardProps) => {
  return (
    <Box
      sx={{
        p: 4,
        borderRadius: '14px',
        border: '1px dashed #D1D5DB',
        backgroundColor: '#FFFFFF',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
      }}
    >
      <Typography variant="body1" sx={{ color: '#4B5563', fontWeight: 500 }}>
        {content}
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onClick}
        sx={{
          backgroundColor: '#2563EB',
          color: '#FFFFFF',
          fontWeight: 600,
          borderRadius: '8px',
          px: 2.5,
          py: 0.8,
          textTransform: 'none',
          '&:hover': {
            backgroundColor: '#1D4ED8',
          },
        }}
      >
        {labelButton}
      </Button>
    </Box>
  );
};

export default EmptyCard;
