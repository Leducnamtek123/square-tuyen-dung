import React from 'react';
import { Box, Card, Stack, Typography } from '@mui/material';
import MuiImageCustom from '../../../components/Common/MuiImageCustom';
import type { StaticImageData } from 'next/image';

type Props = {
  title: string;
  descriptions: string[];
  imageSrc: StaticImageData | string;
  reverse?: boolean;
};

const AboutDetailSection = ({ title, descriptions, imageSrc, reverse }: Props) => {
  return (
    <Box sx={{ mt: 5 }}>
      <Card sx={{ p: 5 }}>
        <Stack direction={{ xs: 'column', md: reverse ? 'row-reverse' : 'row' }} spacing={2}>
          <Box width="100%">
            <Box sx={{ height: 400 }}>
              <MuiImageCustom src={imageSrc} />
            </Box>
          </Box>

          <Box>
            <Stack spacing={2}>
              <Typography variant="h4" sx={{ color: 'warning.main', fontSize: 30 }}>
                {title}
              </Typography>
              {descriptions.map((text) => (
                <Typography key={text} textAlign="justify" color="text.secondary">
                  {text}
                </Typography>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
};

export default AboutDetailSection;
