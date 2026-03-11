import React from "react";
import { Box, Typography } from "@mui/material";

const JobDetailInfoItem = ({ title, value }) => {
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
            ChÆ°a cáº­p nháº­t
          </span>
        )}
      </Typography>
    </Box>
  );
};

export default JobDetailInfoItem;
