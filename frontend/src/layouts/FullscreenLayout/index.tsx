'use client';

import React from "react";
import { Box } from "@mui/material";

const FullscreenLayout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Box sx={{ minHeight: "100vh", width: "100%" }}>
      {children}
    </Box>
  );
};

export default FullscreenLayout;
