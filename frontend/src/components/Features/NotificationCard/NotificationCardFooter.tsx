import React from 'react';
import { Grid2 as Grid, Stack, Typography } from '@mui/material';

type Props = {
  count: number;
  notificationsLength: number;
  onLoadMore: () => void;
  onClearAll: () => void;
};

const NotificationCardFooter = ({ count, notificationsLength, onLoadMore, onClearAll }: Props) => {
  return (
    <Grid container>
      <Grid size={4} />
      <Grid size={4}>
        {Math.ceil(count / 5) > 1 && (
          <Stack direction="row" alignItems="center" justifyContent="center">
            <Typography fontWeight="bold" textAlign="center" color="GrayText">
              <button type="button" onClick={onLoadMore} style={{ cursor: 'pointer', background: 'none', border: 0, padding: 0, color: 'inherit', font: 'inherit' }}>
                Load more
              </button>
            </Typography>
          </Stack>
        )}
      </Grid>
      <Grid size={4}>
        {notificationsLength > 0 && (
          <Stack direction="row" justifyContent="flex-end">
            <Typography variant="caption" color="red" textAlign="center">
              <button type="button" onClick={onClearAll} style={{ cursor: 'pointer', background: 'none', border: 0, padding: 0, color: 'inherit', font: 'inherit' }}>
                Clear all
              </button>
            </Typography>
          </Stack>
        )}
      </Grid>
    </Grid>
  );
};

export default NotificationCardFooter;
