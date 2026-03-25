import React from "react";
import { Box, Skeleton, Stack, Typography } from "@mui/material";

const ItemLoading = () => {
  const [parentWidth, setParentWidth] = React.useState(0);
  const [stackDirection, setStackDirection] = React.useState<'row' | 'column'>("column");

  React.useEffect(() => {
    const handleResize = () => {
      const element = document.getElementById("job-post-notification-loading");
      if (element) {
        setParentWidth(element.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    if (parentWidth < 600) {
      setStackDirection("column");
    } else {
      setStackDirection("row");
    }
  }, [parentWidth]);

  return (
    <div id="job-post-notification-loading">
      <Box>
        <Stack direction="row" spacing={3} alignItems="center">
          <Box flex={1}>
            <Stack spacing={1}>
              <Box>
                <Typography fontSize={18} fontWeight={"bold"}>
                  <Skeleton />
                </Typography>
              </Box>
              <Stack direction={stackDirection} spacing={3}>
                <Box>
                  <Typography fontWeight="bold" color="GrayText" fontSize={14}>
                    <Skeleton width={100} />
                  </Typography>
                </Box>
                <Box>
                  <Typography fontWeight="bold" color="GrayText" fontSize={14}>
                    <Skeleton width={100} />
                  </Typography>
                </Box>
                <Box>
                  <Typography fontWeight="bold" color="GrayText" fontSize={14}>
                    <Skeleton width={100} />
                  </Typography>
                </Box>
                <Box>
                  <Typography fontWeight="bold" color="GrayText" fontSize={14}>
                    <Skeleton width={100} />
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box><Skeleton width={50} height={40} /></Box>
            <Box><Skeleton width={50} height={40} /></Box>
            <Box><Skeleton width={50} height={40} /></Box>
          </Stack>
        </Stack>
      </Box>
    </div>
  );
};

export default ItemLoading;
