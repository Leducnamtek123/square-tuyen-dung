 'use client';
import React from 'react';
import Link from 'next/link';
import { Grid2 as Grid, Stack, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../../../hooks/useAppStore';
import { buildJobPostFilter, searchJobPost } from '../../../../redux/filterSlice';
import { ROUTES } from '../../../../configs/constants';
import { localizeRoutePath } from '../../../../configs/routeLocalization';
import { useConfig } from '@/hooks/useConfig';

interface Option {
  id: string | number;
  name: string;
}

type CategoryType = 'CAREER' | 'CITY' | 'JOB_TYPE';

const maxItem = 6;

type CategorySectionProps = {
  title: string;
  items: Option[];
  viewAllHref: string;
  selectHref: string;
  viewAllLabel: string;
  hoverColor?: string;
  onSelect: (id: string | number) => void;
};

const normalizeOptions = (options: Option[] = []) =>
  options
    .map((option) => ({
      id: option.id === null || option.id === undefined ? '' : String(option.id),
      name: String(option.name ?? '').trim(),
    }))
    .filter((option) => option.id && option.name);

const CategorySection = ({
  title,
  items,
  viewAllHref,
  selectHref,
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
          component={Link}
          href={selectHref}
          prefetch
          onClick={() => onSelect(item.id)}
          sx={{
            cursor: 'pointer',
            color: 'inherit',
            textDecoration: 'none',
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
  const { t, i18n } = useTranslation('public');
  const { allConfig } = useConfig();
  const dispatch = useAppDispatch();
  const jobsHref = localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, i18n.language);

  const careerOptions = normalizeOptions((allConfig?.careerOptions || []) as Option[]);
  const cityOptions = normalizeOptions((allConfig?.cityOptions || []) as Option[]);
  const jobTypeOptions = normalizeOptions((allConfig?.jobTypeOptions || []) as Option[]);

  const handleFilter = (id: string | number, type: CategoryType) => {
    switch (type) {
      case 'CAREER':
        dispatch(searchJobPost(buildJobPostFilter({ careerId: String(id) })));
        break;
      case 'CITY':
        dispatch(searchJobPost(buildJobPostFilter({ cityId: String(id) })));
        break;
      case 'JOB_TYPE':
        dispatch(searchJobPost(buildJobPostFilter({ jobTypeId: String(id) })));
        break;
    }
  };

  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
        <CategorySection
          title={t('jobByCategory.jobsByCareer')}
          items={careerOptions}
          viewAllHref={localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS_BY_CAREER}`, i18n.language)}
          selectHref={jobsHref}
          viewAllLabel={t('jobByCategory.viewAllCareers')}
          hoverColor="primary.main"
          onSelect={(id) => handleFilter(id, 'CAREER')}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
        <CategorySection
          title={t('jobByCategory.jobsByCity')}
          items={cityOptions}
          viewAllHref={localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS_BY_CITY}`, i18n.language)}
          selectHref={jobsHref}
          viewAllLabel={t('jobByCategory.viewAllCities')}
          hoverColor="primary.main"
          onSelect={(id) => handleFilter(id, 'CITY')}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
        <CategorySection
          title={t('jobByCategory.jobsByJobType')}
          items={jobTypeOptions}
          viewAllHref={localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS_BY_TYPE}`, i18n.language)}
          selectHref={jobsHref}
          viewAllLabel={t('jobByCategory.viewAllJobTypes')}
          hoverColor="primary.main"
          onSelect={(id) => handleFilter(id, 'JOB_TYPE')}
        />
      </Grid>
    </Grid>
  );
};

export default JobByCategory;
