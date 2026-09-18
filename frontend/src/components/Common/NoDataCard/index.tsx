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
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
        p: { xs: 4, sm: 6 },
        textAlign: 'center',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: '#CBD5E1',
          boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      <Stack
        spacing={2.5}
        alignItems="center"
        justifyContent="center"
        sx={{
          minHeight: 230,
        }}
      >
        <Box
          sx={{
            width: { xs: 140, sm: 180 },
            height: { xs: 140, sm: 160 },
            p: 2,
            borderRadius: '20px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #DBEAFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.04)',
              backgroundColor: '#E0F2FE',
              borderColor: '#BFDBFE',
            },
          }}
        >
          {imgComponentSgv ? (
            imgComponentSgv
          ) : (
            <SvgIcon
              src={
                typeof SVG_IMAGES[svgKey as keyof typeof SVG_IMAGES] === 'object'
                  ? (SVG_IMAGES[svgKey as keyof typeof SVG_IMAGES] as any)?.src || ''
                  : (SVG_IMAGES[svgKey as keyof typeof SVG_IMAGES] || '')
              }
            />
          )}
        </Box>
        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: '1.05rem', sm: '1.18rem' },
            fontWeight: 700,
            color: '#0F172A',
            letterSpacing: '-0.01em',
          }}
        >
          {displayTitle}
        </Typography>
        {content && (
          <Typography
            variant="body2"
            sx={{
              color: '#64748B',
              maxWidth: 440,
              fontSize: '0.9rem',
              lineHeight: 1.6,
            }}
          >
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
              px: 3.5,
              py: 1.1,
              borderRadius: '10px',
              textTransform: 'none',
              fontSize: '0.9rem',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.22)',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#1D4ED8',
                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
                transform: 'translateY(-1px)',
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
