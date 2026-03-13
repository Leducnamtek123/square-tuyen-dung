import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";

const JobDetailInfoItem = ({ title, value }) => {
  const { t } = useTranslation(["public"]);
  return (
    <Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontWeight: "normal", pb: 1 }}
      >
        {title}
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ textAlign: "justify" }}>
        {value ? (
          <span style={{ fontWeight: "bold" }}>{value}</span>
        ) : (
          <span style={{ color: "#e0e0e0", fontStyle: "italic", fontSize: 13 }}>
            {t("jobDetail.notUpdated")}
          </span>
        )}
      </Typography>
    </Box>
  );
};

export default JobDetailInfoItem;
