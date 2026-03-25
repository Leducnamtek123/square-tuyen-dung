import React from 'react';
import { Skeleton } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useTranslation } from 'react-i18next';

const CompanyFormLoading = () => {
  const { t } = useTranslation('employer');
  return (
    <Grid container>
      <Grid size={{ xs: 12, sm: 12, md: 12, lg: 10, xl: 10 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}><Skeleton height={50} /></Grid>
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}><Skeleton height={50} /></Grid>
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}><Skeleton height={50} /></Grid>
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}><Skeleton height={50} /></Grid>
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}><Skeleton height={50} /></Grid>
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}><Skeleton height={50} /></Grid>
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}><Skeleton height={50} /></Grid>
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}><Skeleton height={50} /></Grid>
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}><Skeleton height={50} /></Grid>
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}><Skeleton height={50} /></Grid>
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}><Skeleton height={50} /></Grid>
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}><Skeleton height={50} /></Grid>
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}><Skeleton height={50} /></Grid>
          <Grid size={12}><Skeleton height={50} /></Grid>
          <Grid size={12}><Skeleton height={50} /></Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default CompanyFormLoading;
