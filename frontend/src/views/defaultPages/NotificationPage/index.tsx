 'use client';
import React from "react";
import { Card, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { TabTitle } from "../../../utils/generalFunction";
import NotificationCard from "../../components/defaults/NotificationCard";
import { APP_NAME } from "../../../configs/constants";



const NotificationPage = () => {
  const { t } = useTranslation();

  TabTitle(t("notificationTitle", { appName: APP_NAME }));

  return (

    <Card sx={{ p: { xs: 2, sm: 2, md: 2, lg: 3, xl: 3 } }}>

      {/* Start: NotificationCard */}

      <NotificationCard

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

            {t("notificationTitle", { appName: APP_NAME })}

          </Typography>

        }

      />

      {/* End: NotificationCard  */}

    </Card>

  );

};

export default NotificationPage;
