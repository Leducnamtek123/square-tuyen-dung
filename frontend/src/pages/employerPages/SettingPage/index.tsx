// @ts-nocheck
import React from "react";
import { Card, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid2";

import SettingCard from "../../components/settings/SettingCard";

interface Props {
  [key: string]: any;
}



const SettingPage = () => {
  const { t } = useTranslation("employer");

  return (
    <Stack spacing={3}>
      <Card>
        <Grid container>
          <Grid
            size={{
              xs: 12,
              sm: 12,
              md: 6,
              lg: 5,
              xl: 5
            }}>
            {/* Start: Setting card */}
            <SettingCard
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
                  {t('setting.title')}
                </Typography>
              }
              sx={{ boxShadow: 0 }}
            />
            {/* End: Setting card */}
          </Grid>
        </Grid>
      </Card>
    </Stack>
  );
};

export default SettingPage;
