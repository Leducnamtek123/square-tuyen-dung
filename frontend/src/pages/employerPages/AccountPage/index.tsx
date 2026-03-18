// @ts-nocheck
import React from "react";
import { Card, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid2";

import { TabTitle } from "../../../utils/generalFunction";
import AccountCard from "../../components/auths/AccountCard";

interface Props {
  [key: string]: any;
}



const AccountPage = () => {
  const { t } = useTranslation("employer");
  TabTitle(`${t('account.pageTitle')} - Employer Account Management`);

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
                  {t('account.info')}
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
