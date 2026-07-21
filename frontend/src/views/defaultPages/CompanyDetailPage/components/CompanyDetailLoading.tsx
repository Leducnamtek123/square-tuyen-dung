import React from "react";
import { Box, Card, Skeleton, Stack, Typography } from "@mui/material";

const CompanyDetailLoading = () => {
  return (
    <Stack>
      <Card>
        <Box height={250}>
          <Skeleton variant="rounded" width={"100%"} height={"100%"} />
        </Box>
        <Box sx={{ p: 3, pt: 1 }}>
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={2}
            alignItems="center"
          >
            <Box>
              <Skeleton variant="rounded" width={120} height={120} />
            </Box>
            <Stack flex={1} spacing={2}>
              <Skeleton variant="rounded" />
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={{ xs: 0.5, sm: 2, md: 3 }}
              >
                <Skeleton variant="rounded" width={140} />
                <Skeleton variant="rounded" width={160} />
                <Skeleton variant="rounded" width={180} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <Skeleton variant="rounded" width={90} height={35} />
                <Skeleton variant="rounded" width={90} height={35} />
                <Skeleton variant="rounded" width={90} height={35} />
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Card>

      <Stack direction="row" spacing={3} mt={3}>
        <Stack flex={2} spacing={2}>
          <Card>
            <Stack spacing={2} p={3}>
              <Typography variant="h6">
                <Skeleton width={160} />
              </Typography>
              <Skeleton height={20} />
              <Skeleton height={20} />
              <Skeleton height={20} />
              <Skeleton height={20} />
              <Skeleton height={20} />
            </Stack>
          </Card>

          <Card>
            <Stack spacing={2} p={3}>
              <Typography variant="h6">
                <Skeleton width={160} />
              </Typography>
              <Skeleton height={20} />
              <Skeleton height={20} />
              <Skeleton height={20} />
              <Skeleton height={20} />
              <Skeleton height={20} />
            </Stack>
          </Card>
        </Stack>
        <Stack flex={1} spacing={2}>
          <Card>
            <Stack spacing={2} p={3}>
              <Typography variant="h6">
                <Skeleton width={160} />
              </Typography>
              <Skeleton height={20} />
              <Skeleton height={20} />
              <Skeleton height={20} />
              <Skeleton height={20} />
              <Skeleton height={20} />
            </Stack>
          </Card>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default CompanyDetailLoading;
