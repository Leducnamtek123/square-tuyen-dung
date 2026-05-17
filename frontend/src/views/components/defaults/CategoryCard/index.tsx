'use client';
import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { InputBase, Paper, Typography } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { buildJobPostFilter, searchJobPost } from '../../../../redux/filterSlice';
import { ROUTES } from '../../../../configs/constants';
import { localizeRoutePath } from '../../../../configs/routeLocalization';

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
            p: '2px 5px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            backgroundColor: 'white',
            border: 1,
            borderColor: '#441da0',
            maxWidth: { xs: '100%', md: '30%' },
            mb: 1,
          }}
          onSubmit={(event) => event.preventDefault()}
        >
          <SearchIcon color="disabled" />
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            slotProps={{ input: { 'aria-label': 'search' } }}
            defaultValue=""
            placeholder={t('quickSearch')}
            onChange={(event) => handleFilterChange(event.target.value)}
          />
        </Paper>
      </Grid>
      {items.map((item) => (
        <Grid key={`${type}-${item.id}`} size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }}>
          <Typography
            component={Link}
            href={jobsHref}
            prefetch
            sx={{
              cursor: 'pointer',
              color: 'inherit',
              textDecoration: 'none',
              '&:hover': {
                color: '#fca34d',
                fontWeight: 'bold',
              },
            }}
            onClick={() => handleFilter(item.id)}
          >
            {item.name}
          </Typography>
        </Grid>
      ))}
    </Grid>
  );
};

export default CategoryCard;
