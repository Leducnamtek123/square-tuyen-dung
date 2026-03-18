// @ts-nocheck
import React from "react";
import { Box, Card, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";

interface Props {
  [key: string]: any;
}



const JobDetailLoading = () => {
  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 12,
            sm: 12,
            md: 8,
            lg: 8,
            xl: 8
          }}>
          {/* Start: thong tin chung */}
          <Card sx={{ py: 2, px: 4 }}>
            <Stack>
              <Box>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Skeleton variant="circular" width={65} height={65} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">
                      <Skeleton />
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      <Skeleton width={200} />
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              <Box sx={{ my: 1 }}></Box>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h5">
                    <Skeleton height={50} />
                  </Typography>
                </Box>
                <Stack direction="row" spacing={3}>
                  <Typography variant="subtitle2" sx={{ flex: 1 }}>
                    <Skeleton />
                  </Typography>
                  <Typography variant="subtitle2" sx={{ flex: 1 }}>
                    <Skeleton />
                  </Typography>
                  <Typography variant="subtitle2" sx={{ flex: 1 }}>
                    <Skeleton />
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Skeleton variant="rounded" width={100} height={40} />
                  <Skeleton variant="rounded" width={100} height={40} />
                  <Skeleton variant="rounded" width={100} height={40} />
                </Stack>
              </Stack>
              <Box sx={{ my: 1 }}></Box>
              <Box>
                <Grid container spacing={2}>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 12,
                      md: 6,
                      lg: 3,
                      xl: 3
                    }}>
                    <Skeleton />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 12,
                      md: 6,
                      lg: 3,
                      xl: 3
                    }}>
                    <Skeleton />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 12,
                      md: 6,
                      lg: 3,
                      xl: 3
                    }}>
                    <Skeleton />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 12,
                      md: 6,
                      lg: 3,
                      xl: 3
                    }}>
                    <Skeleton />
                  </Grid>
                </Grid>
              </Box>
              <Box sx={{ my: 1 }}></Box>
              <Box>
                <Stack>
                  <Typography variant="h5" gutterBottom>
                    <Skeleton />
                  </Typography>
                  <Box>
                    <Grid container spacing={2}>
                      <Grid
                        size={{
                          xs: 12,
                          sm: 12,
                          md: 6,
                          lg: 6,
                          xl: 6
                        }}>
                        <Skeleton />
                      </Grid>
                      <Grid
                        size={{
                          xs: 12,
                          sm: 12,
                          md: 6,
                          lg: 6,
                          xl: 6
                        }}>
                        <Skeleton />
                      </Grid>
                      <Grid
                        size={{
                          xs: 12,
                          sm: 12,
                          md: 6,
                          lg: 6,
                          xl: 6
                        }}>
                        <Skeleton />
                      </Grid>
                      <Grid
                        size={{
                          xs: 12,
                          sm: 12,
                          md: 6,
                          lg: 6,
                          xl: 6
                        }}>
                        <Skeleton />
                      </Grid>
                      <Grid
                        size={{
                          xs: 12,
                          sm: 12,
                          md: 6,
                          lg: 6,
                          xl: 6
                        }}>
                        <Skeleton />
                      </Grid>
                      <Grid
                        size={{
                          xs: 12,
                          sm: 12,
                          md: 6,
                          lg: 6,
                          xl: 6
                        }}>
                        <Skeleton />
                      </Grid>
                    </Grid>
                  </Box>
                </Stack>
              </Box>
              <Box></Box>
            </Stack>
          </Card>
          {/* End: thong tin chung */}

          {/* Start: mo ta chi tiet */}
          <Card sx={{ p: 4, mt: 3 }}>
            <Stack spacing={4}>
              <Box>
                <Typography variant="h5">
                  <Skeleton />
                </Typography>
                <Box sx={{ pt: 1 }}>
                  <Skeleton variant="rounded" height={100} />
                </Box>
              </Box>
              <Box>
                <Typography variant="h5">
                  <Skeleton />
                </Typography>
                <Box sx={{ pt: 1 }}>
                  <Skeleton variant="rounded" height={100} />
                </Box>
              </Box>
              <Box>
                <Typography variant="h5">
                  <Skeleton />
                </Typography>
                <Box sx={{ pt: 1 }}>
                  <Skeleton variant="rounded" height={100} />
                </Box>
              </Box>
            </Stack>
            <Box sx={{ my: 1 }}></Box>
            <Stack direction="row" spacing={2}>
              <Skeleton variant="rounded" width={100} height={40} />
              <Skeleton variant="rounded" width={100} height={40} />
              <Skeleton variant="rounded" width={100} height={40} />
            </Stack>
          </Card>
          {/* End: mo ta chi tiet */}

          {/* Start: thong tin lien he */}
          <Card sx={{ p: 4, mt: 3 }}>
            <Grid container spacing={2}>
              <Grid size={8}>
                <Box>
                  <Typography variant="h5">
                    <Skeleton />
                  </Typography>
                  <Stack sx={{ pt: 1 }} spacing={2}>
                    <Skeleton />
                    <Skeleton />
                    <Skeleton />
                    <Skeleton />
                  </Stack>
                </Box>
              </Grid>
              <Grid size={4}>
                <Box>
                  <Typography variant="h5">
                    <Skeleton />
                  </Typography>
                  <Stack sx={{ pt: 1 }} spacing={2}>
                    <Skeleton />
                    <Skeleton />
                    <Skeleton />
                    <Skeleton />
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Card>
          {/* End: thong tin lien he */}
        </Grid>
      </Grid>
    </Box>
  );
};

export default JobDetailLoading;
