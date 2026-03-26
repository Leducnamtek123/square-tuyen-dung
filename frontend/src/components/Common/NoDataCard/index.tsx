import React from 'react';
import { Box, Button, Stack, Typography } from "@mui/material";
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
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{
        p: 3,
        minHeight: 200,
      }}
    >
      <Box sx={{ width: { xs: 150, sm: 200 } }}>
        {imgComponentSgv ? (
          imgComponentSgv
        ) : (
          <SvgIcon src={(SVG_IMAGES as any)[svgKey]} />
        )}
      </Box>
      <Typography variant="h6" align="center">
        {displayTitle}
      </Typography>
      {content && (
        <Typography variant="body2" align="center" color="text.secondary">
          {content}
        </Typography>
      )}
      {buttonText && (
        <Button variant="contained" onClick={onClick}>
          {buttonText}
        </Button>
      )}
      {children}
    </Stack>
  );
};

export default NoDataCard;
