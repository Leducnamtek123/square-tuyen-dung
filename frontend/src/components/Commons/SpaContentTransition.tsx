'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Box, Skeleton, Card, Grid2 as Grid } from '@mui/material';

interface SpaContentTransitionProps {
  children: React.ReactNode;
}

const LinkedInSkeleton = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Skeleton variant="rounded" height={100} sx={{ borderRadius: '16px' }} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Skeleton variant="rounded" height={260} sx={{ borderRadius: '16px' }} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Skeleton variant="rounded" height={260} sx={{ borderRadius: '16px' }} />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" height={200} sx={{ borderRadius: '16px' }} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" height={200} sx={{ borderRadius: '16px' }} />
        </Grid>
      </Grid>
    </Box>
  );
};

const SpaContentTransition = ({ children }: SpaContentTransitionProps) => {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [displayChildren, setDisplayChildren] = React.useState(children);

  React.useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsTransitioning(false);
    }, 120);

    return () => clearTimeout(timer);
  }, [pathname, children]);

  return (
    <Box
      id="main-content"
      sx={{
        width: '100%',
        minHeight: '400px',
        position: 'relative',
        animation: 'fadeInTranslate 220ms ease-out forwards',
        '@keyframes fadeInTranslate': {
          '0%': {
            opacity: 0.3,
            transform: 'translateY(8px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0px)',
          },
        },
      }}
    >
      {isTransitioning ? <LinkedInSkeleton /> : displayChildren}
    </Box>
  );
};

export default SpaContentTransition;
