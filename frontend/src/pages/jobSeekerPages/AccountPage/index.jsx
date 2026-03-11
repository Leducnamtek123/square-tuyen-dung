/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import React from 'react';
import { Card } from "@mui/material";
import Grid from "@mui/material/Grid2";

import { TabTitle } from '../../../utils/generalFunction';
import AccountCard from '../../components/auths/AccountCard';
import PersonalInfoCard from '../../components/jobSeekers/PersonalInfoCard';
import SettingCard from '../../components/settings/SettingCard';

const AccountPage = () => {
  TabTitle('Job Seeker Account Management');

  return (
    <Grid spacing={3} container>
      <Grid
        size={{
          xs: 12,
          sm: 12,
          md: 5,
          lg: 6,
          xl: 6
        }}>
        <Card>
          {/* Start: Account card */}
          <AccountCard title="Account Information" />
          {/* End: Account card */}
        </Card>
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 12,
          md: 7,
          lg: 6,
          xl: 6
        }}>
        <Card>
          {/* Start: Personal info */}
          <PersonalInfoCard title="Personal Information" />
          {/* End: Personal info  */}
        </Card>

        <Card sx={{ marginTop: 3 }}>
          {/* Start: SettingCard info */}
          <SettingCard title="Settings" />
          {/* End: SettingCard info  */}
        </Card>
      </Grid>
    </Grid>
  );
};

export default AccountPage;
