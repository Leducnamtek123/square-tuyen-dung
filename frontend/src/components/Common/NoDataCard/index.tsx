import React from 'react';
import { Box, Button, Card, Stack, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { SVG_IMAGES } from '@/configs/constants';
import SvgIcon from '@/components/Common/SvgIcon';

interface NoDataCardProps {
  title?: string;
  content?: string;
  buttonText?: string;
  onClick?: () => void;
  svgKey?: string;
  imgComponentSgv?: React.ReactNode;
  children?: React.ReactNode;
}

const NoDataCard = ({
  title,
  content,
  buttonText,
  onClick,
  svgKey = 'ImageSvg1',
  imgComponentSgv,
  children,
}: NoDataCardProps) => {
  const { t } = useTranslation('common');
  const displayTitle = title || t('noData');

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '14px',
        border: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.04)',
        p: { xs: 3, sm: 5 },
        textAlign: 'center',
      }}
    >
      <Stack
        spacing={2}
        alignItems="center"
        justifyContent="center"
        sx={{
          minHeight: 220,
        }}
      >
        <Box sx={{ width: { xs: 140, sm: 180 }, mb: 1, opacity: 0.9 }}>
          {imgComponentSgv ? (
            imgComponentSgv
          ) : (
            <SvgIcon src={SVG_IMAGES[svgKey as keyof typeof SVG_IMAGES]} />
          )}
        </Box>
        <Typography variant="h3" sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>
          {displayTitle}
        </Typography>
        {content && (
          <Typography variant="body2" sx={{ color: '#6B7280', maxWidth: 420, fontSize: '0.875rem' }}>
            {content}
          </Typography>
        )}
        {buttonText && (
          <Button
            variant="contained"
            onClick={onClick}
            sx={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: '8px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#1D4ED8',
              },
            }}
          >
            {buttonText}
          </Button>
        )}
        {children}
      </Stack>
    </Card>
  );
};

export default NoDataCard;
