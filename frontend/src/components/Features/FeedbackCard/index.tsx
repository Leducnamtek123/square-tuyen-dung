import React from 'react';
import { Box, Card, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuoteLeft } from '@fortawesome/free-solid-svg-icons';
import MuiImageCustom from '@/components/Common/MuiImageCustom';
import type { Theme as StylesTheme } from '@mui/material/styles';

interface FeedbackCardProps {
  id?: string | number;
  avatarUrl?: string;
  fullName?: string;
  content?: string;
}

const TESTIMONIAL_AVATARS = [
  '/images/testimonials/avatar-1.jpg',
  '/images/testimonials/avatar-2.jpg',
  '/images/testimonials/avatar-3.jpg',
  '/images/testimonials/avatar-4.jpg',
] as const;

const pickFallbackAvatar = (seed?: string | number) => {
  const value = String(seed || 'testimonial');
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return TESTIMONIAL_AVATARS[hash % TESTIMONIAL_AVATARS.length];
};

const FeedbackCard = ({ id, avatarUrl = '', fullName = '', content = '' }: FeedbackCardProps) => {
  const theme = useTheme();
  const fallbackAvatar = React.useMemo(() => pickFallbackAvatar(id || fullName), [id, fullName]);
  const resolvedAvatar = avatarUrl || fallbackAvatar;

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: '100%',
        p: 2.25,
        py: 2.25,
        mb: 1,
        boxShadow: (t: StylesTheme) => t.customShadows.card,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (t: StylesTheme) => t.customShadows.large,
        },
      }}
    >
      <Stack sx={{ mb: 1.75 }} direction="row" justifyContent="center">
        <MuiImageCustom
          sx={{
            borderRadius: '50%',
            border: (t: StylesTheme) => `4px solid ${t.palette.primary.light}`,
            boxShadow: (t: StylesTheme) => t.customShadows.medium,
            objectFit: 'cover',
            backgroundColor: (t: StylesTheme) => t.palette.common.white,
          }}
          width={96}
          height={96}
          fit="cover"
          src={resolvedAvatar}
          fallbackSrc={fallbackAvatar}
        />
      </Stack>

      <Typography
        variant="h6"
        component="h6"
        gutterBottom
        sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          color: (t: StylesTheme) => t.palette.primary.main,
          mb: 1.1,
          minHeight: 32,
        }}
      >
        {fullName}
      </Typography>

      <Typography textAlign="center" sx={{ mb: 1 }}>
        <FontAwesomeIcon
          icon={faQuoteLeft}
          fontSize={28}
          color={theme.palette.warning.main}
          style={{ opacity: 0.8 }}
        />
      </Typography>

      <Box sx={{ width: '100%' }}>
        <Typography
          variant="body2"
          display="block"
          gutterBottom
          sx={{
            textAlign: 'center',
            color: (t: StylesTheme) => t.palette.text.secondary,
            px: 0.5,
            lineHeight: 1.7,
            fontStyle: 'italic',
            minHeight: 86,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: '4',
            WebkitBoxOrient: 'vertical',
          }}
        >
          {content}
        </Typography>
      </Box>
    </Card>
  );
};

const Loading = () => (
  <Card
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      p: 2.25,
      py: 2.25,
      mb: 1,
      boxShadow: (theme: StylesTheme) => theme.customShadows.card,
    }}
  >
    <Skeleton
      variant="circular"
      width={96}
      height={96}
      sx={{
        margin: '0 auto',
        mb: 2,
        backgroundColor: (theme: StylesTheme) => theme.palette.grey[200],
      }}
    />
    <Stack sx={{ width: '100%' }}>
      <Skeleton
        height={28}
        width="60%"
        sx={{
          margin: '0 auto',
          mb: 1.5,
          backgroundColor: (theme: StylesTheme) => theme.palette.grey[200],
        }}
      />
      <Skeleton
        height={18}
        width="42%"
        sx={{
          margin: '0 auto',
          mb: 1.5,
          backgroundColor: (theme: StylesTheme) => theme.palette.grey[200],
        }}
      />
      <Skeleton
        height={86}
        sx={{
          backgroundColor: (theme: StylesTheme) => theme.palette.grey[200],
        }}
      />
    </Stack>
  </Card>
);

FeedbackCard.Loading = Loading;

export default FeedbackCard;
