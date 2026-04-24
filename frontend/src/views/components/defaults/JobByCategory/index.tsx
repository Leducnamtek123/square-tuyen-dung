 'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Grid2 as Grid, Stack, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../hooks/useAppStore';
import { searchJobPost } from '../../../../redux/filterSlice';
import { ROUTES } from '../../../../configs/constants';
import { useConfig } from '@/hooks/useConfig';

interface Option {
  id: string | number;
  name: string;
}

type CategoryType = 'CARRER' | 'CITY' | 'JOB_TYPE';

const maxItem = 6;

type CategorySectionProps = {
  title: string;
  items: Option[];
  viewAllHref: string;
  viewAllLabel: string;
  hoverColor?: string;
  onSelect: (id: string | number) => void;
};

const CategorySection = ({
  title,
  items,
  viewAllHref,
  viewAllLabel,
  hoverColor = 'primary.main',
  onSelect,
}: CategorySectionProps) => (
  <Stack spacing={2.5} sx={{ p: 3, height: '100%' }}>
    <Typography
      variant="h6"
      sx={{
        color: 'primary.main',
        borderBottom: '2px solid',
        borderColor: 'primary.main',
        pb: 1,
      }}
    >
      {title}
    </Typography>

    <Stack spacing={1.5}>
      {items.slice(0, maxItem).map((item) => (
        <Typography
          key={item.id}
          onClick={() => onSelect(item.id)}
          sx={{
            cursor: 'pointer',
            py: 0.5,
            px: 1.5,
            borderRadius: 1,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'primary.background',
              color: hoverColor,
              transform: 'translateX(8px)',
            },
          }}
        >
          {item.name}
        </Typography>
      ))}

      {items.length > maxItem && (
        <Typography
          variant="subtitle2"
          component={Link}
          href={viewAllHref}
          sx={{
            mt: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'primary.main',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'none',
            '&:hover': {
              color: 'primary.dark',
            },
          }}
        >
          {viewAllLabel} <FontAwesomeIcon icon={faChevronRight} />
        </Typography>
      )}
    </Stack>
  </Stack>
);

const JobByCategory = () => {
  const { t } = useTranslation('public');
  const { allConfig } = useConfig();
  const dispatch = useAppDispatch();
  const nav = useRouter();
  const { jobPostFilter } = useAppSelector((state) => state.filter);

  const careerOptions = (allConfig?.careerOptions || []) as Option[];
  const cityOptions = (allConfig?.cityOptions || []) as Option[];
  const jobTypeOptions = (allConfig?.jobTypeOptions || []) as Option[];

  const handleFilter = (id: string | number, type: CategoryType) => {
    switch (type) {
      case 'CARRER':
        dispatch(searchJobPost({ ...jobPostFilter, careerId: String(id) }));
        break;
      case 'CITY':
        dispatch(searchJobPost({ ...jobPostFilter, cityId: String(id) }));
        break;
      case 'JOB_TYPE':
        dispatch(searchJobPost({ ...jobPostFilter, jobTypeId: String(id) }));
        break;
    }

    nav.push(`/${ROUTES.JOB_SEEKER.JOBS}`);
  };

  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
        <CategorySection
          title={t('jobByCategory.jobsByCareer')}
          items={careerOptions}
          viewAllHref={`/${ROUTES.JOB_SEEKER.JOBS_BY_CAREER}`}
          viewAllLabel={t('jobByCategory.viewAllCareers')}
          hoverColor="primary.main"
          onSelect={(id) => handleFilter(id, 'CARRER')}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
        <CategorySection
          title={t('jobByCategory.jobsByCity')}
          items={cityOptions}
          viewAllHref={`/${ROUTES.JOB_SEEKER.JOBS_BY_CITY}`}
          viewAllLabel={t('jobByCategory.viewAllCities')}
          hoverColor="primary.main"
          onSelect={(id) => handleFilter(id, 'CITY')}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
        <CategorySection
          title={t('jobByCategory.jobsByJobType')}
          items={jobTypeOptions}
          viewAllHref={`/${ROUTES.JOB_SEEKER.JOBS_BY_TYPE}`}
          viewAllLabel={t('jobByCategory.viewAllJobTypes')}
          hoverColor="primary.main"
          onSelect={(id) => handleFilter(id, 'JOB_TYPE')}
        />
      </Grid>
    </Grid>
  );
};

export default JobByCategory;
