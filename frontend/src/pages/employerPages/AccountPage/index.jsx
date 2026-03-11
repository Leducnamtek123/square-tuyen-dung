/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import React from "react";
import { Card, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";

import { TabTitle } from "../../../utils/generalFunction";
import AccountCard from "../../components/auths/AccountCard";

const AccountPage = () => {
  TabTitle("Employer Account Management");

  return (
    <Stack spacing={3}>
      <Card sx={{ p: 0 }}>
        <Grid container>
          <Grid
            size={{
              xs: 12,
              sm: 12,
              md: 6,
              lg: 5,
              xl: 5
            }}>
            {/* Start: Account card */}
            <AccountCard
              title={
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    background: "primary.gradient",
                    WebkitBackgroundClip: "text",
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  }}
                >
                  Account Information
                </Typography>
              }
              sx={{ boxShadow: 0 }}
            />
            {/* End: Account card */}
          </Grid>
        </Grid>
      </Card>
    </Stack>
  );
};

export default AccountPage;
