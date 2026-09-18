'use client';
import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { InputBase, Paper, Typography } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { buildJobPostFilter, searchJobPost } from '@/redux/filterSlice';
import { ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface CategoryCardProps {
  options: CategoryOption[];
  type: CategoryType;
}

type CategoryOption = {
  id: string | number | null | undefined;
  name?: string | null;
};

type CategoryType = 'CAREER' | 'CARRER' | 'CITY' | 'JOB_TYPE';

const normalizeOptions = (options: CategoryOption[] = []) =>
  options
    .map((option) => ({
      id: option.id === null || option.id === undefined ? '' : String(option.id),
      name: String(option.name ?? '').trim(),
    }))
    .filter((option) => option.id && option.name);

const CategoryCard = ({ options, type }: CategoryCardProps) => {
  const { t, i18n } = useTranslation('common');
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = React.useState('');
  const jobsHref = localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, i18n.language);

  const normalizedOptions = React.useMemo(
    () => normalizeOptions(Array.isArray(options) ? options : []),
    [options]
  );

  const items = React.useMemo(() => {
    const safeValue = String(searchTerm ?? '').toLowerCase();
    return normalizedOptions.filter((option) =>
      String(option?.name ?? '').toLowerCase().includes(safeValue)
    );
  }, [normalizedOptions, searchTerm]);

  const handleFilterChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilter = (id: string) => {
    switch (type) {
      case 'CAREER':
      case 'CARRER':
        dispatch(searchJobPost(buildJobPostFilter({ careerId: id })));
        break;
      case 'CITY':
        dispatch(searchJobPost(buildJobPostFilter({ cityId: id })));
        break;
      case 'JOB_TYPE':
        dispatch(searchJobPost(buildJobPostFilter({ jobTypeId: id })));
        break;
      default:
        break;
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Paper
          component="form"
          sx={{
            boxShadow: 0,
            p: '4px 12px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            backgroundColor: 'white',
            border: 1,
            borderRadius: '12px',
            borderColor: '#cbd5e1',
            maxWidth: { xs: '100%', md: '360px' },
            mb: 2,
          }}
          onSubmit={(event) => event.preventDefault()}
        >
          <SearchIcon color="disabled" />
          <InputBase
            sx={{ ml: 1, flex: 1, fontSize: '0.9rem' }}
            slotProps={{ input: { 'aria-label': 'search' } }}
            defaultValue=""
            placeholder={t('quickSearch', { defaultValue: 'Tìm kiếm nhanh ngành nghề...' })}
            onChange={(event) => handleFilterChange(event.target.value)}
          />
        </Paper>
      </Grid>
      {items.map((item) => (
        <Grid key={`${type}-${item.id}`} size={{ xs: 6, sm: 4, md: 3 }}>
          <Paper
            component={Link}
            href={jobsHref}
            prefetch
            onClick={() => handleFilter(item.id)}
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: { xs: 1.25, sm: 1.75 },
              minHeight: 52,
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              textDecoration: 'none',
              color: '#1e293b',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#ffffff',
                borderColor: '#2563eb',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.1)',
                transform: 'translateY(-2px)',
                '& .category-arrow': {
                  color: '#2563eb',
                  transform: 'translateX(2px)',
                },
              },
              '&:active': {
                transform: 'scale(0.98)',
              },
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: '0.825rem', sm: '0.875rem' },
                fontWeight: 600,
                lineHeight: 1.3,
                color: 'inherit',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {item.name}
            </Typography>
            <ArrowForwardIosIcon
              className="category-arrow"
              sx={{
                fontSize: 11,
                color: '#94a3b8',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                ml: 0.75,
              }}
            />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default CategoryCard;
