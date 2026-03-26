import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { InputBase, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import SearchIcon from '@mui/icons-material/Search';
import { searchJobPost } from '../../../../redux/filterSlice';
import { ROUTES } from '../../../../configs/constants';

interface CategoryCardProps {
  options: any[];
  type: string;
}

const CategoryCard = ({ options, type }: CategoryCardProps) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const nav = useRouter();
  const { jobPostFilter } = useAppSelector((state) => state.filter);
  const [items, setItems] = React.useState(options);

  const handleFilterChange = (value: string) => {
    const safeValue = String(value ?? '').toLowerCase();
    let filterItems = options.filter((option) =>
      String(option?.name ?? '').toLowerCase().includes(safeValue)
    );
    setItems(filterItems);
  };

  const handleFilter = (id: string | number) => {
    switch (type) {
      case 'CARRER':
        dispatch(searchJobPost({ ...jobPostFilter, careerId: id as string }));
        break;
      case 'CITY':
        dispatch(searchJobPost({ ...jobPostFilter, cityId: id as string }));
        break;
      case 'JOB_TYPE':
        dispatch(searchJobPost({ ...jobPostFilter, jobTypeId: id as string }));
        break;
      default:
        break;
    }
    nav.push(`/${ROUTES.JOB_SEEKER.JOBS}`);
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
        <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }}>
          <Typography
            sx={{
              cursor: 'pointer',
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
