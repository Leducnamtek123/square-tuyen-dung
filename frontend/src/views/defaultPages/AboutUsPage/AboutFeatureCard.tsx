import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import type { Theme } from '@mui/material/styles';

type Props = {
  title: string;
  description: string;
  icon: React.ElementType;
};

const AboutFeatureCard = ({ title, description, icon: Icon }: Props) => {
  return (
    <Card
      sx={{
        height: '100%',
        p: 3,
        position: 'relative',
        overflow: 'visible',
        transition: 'all 0.3s ease-in-out',
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'grey.100',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: (theme: Theme) => theme.customShadows.card,
          borderColor: 'primary.light',
          backgroundColor: (theme: Theme) => `${theme.palette.primary.background}`,
          '& .feature-icon': {
            color: 'primary.light',
            transform: 'scale(1.1)',
          },
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          left: 20,
          backgroundColor: 'background.paper',
          borderRadius: '12px',
          p: 1.5,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <Icon
          className="feature-icon"
          sx={{
            fontSize: 32,
            transition: 'all 0.3s ease-in-out',
            color: 'grey.500',
          }}
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'grey.700', fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography sx={{ lineHeight: 1.7, fontSize: '0.95rem', color: 'grey.600' }}>
          {description}
        </Typography>
      </Box>
    </Card>
  );
};

export default AboutFeatureCard;
