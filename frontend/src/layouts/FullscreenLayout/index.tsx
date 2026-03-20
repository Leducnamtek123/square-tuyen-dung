import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

const FullscreenLayout = () => {
  return (
    <Box sx={{ minHeight: "100vh", width: "100%" }}>
      <Outlet />
    </Box>
  );
};

export default FullscreenLayout;
