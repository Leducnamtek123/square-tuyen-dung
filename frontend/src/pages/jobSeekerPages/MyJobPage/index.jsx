/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import * as React from "react";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Card, Stack, Tab, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";

import { TabTitle } from "../../../utils/generalFunction";
import SavedJobCard from "../../components/jobSeekers/SavedJobCard";
import AppliedJobCard from "../../components/jobSeekers/AppliedJobCard";
import SuggestedJobPostCard from "../../components/defaults/SuggestedJobPostCard";
import JobPostNotificationCard from "../../components/jobSeekers/JobPostNotificationCard";
import { useSearchParams } from "react-router-dom";

const MyJobPage = () => {
  TabTitle("My Job Management");

  const [searchParams] = useSearchParams();
  const [value, setValue] = React.useState(searchParams.get("tab") || "1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Grid container spacing={2}>
      <Grid
        size={{
          xs: 12,
          sm: 12,
          md: 7,
          lg: 8,
          xl: 8
        }}>
        <Stack spacing={2}>
          <Card sx={{ p: 1 }}>
            <Box sx={{ width: "100%", typography: "body1" }}>
              <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <TabList
                    onChange={handleChange}
                    aria-label="my job"
                    variant="scrollable"
                    allowScrollButtonsMobile
                  >
                    <Tab
                      label="Saved Jobs"
                      sx={{ textTransform: "capitalize" }}
                      value="1"
                    />
                    <Tab
                      label="Applied Jobs"
                      sx={{ textTransform: "capitalize" }}
                      value="2"
                    />
                    <Tab
                      label="Job Notifications"
                      sx={{ textTransform: "capitalize" }}
                      value="3"
                    />
                  </TabList>
                </Box>
                <TabPanel
                  value="1"
                  sx={{ px: { xs: 0, sm: 1, md: 2, lg: 2, xl: 2 } }}
                >
                  {/* Start: SavedJobCard */}
                  <SavedJobCard />
                  {/* End: SavedJobCard */}
                  <Box mt={1}>
                    <Typography color="gray" variant="caption">
                      Note: You cannot view jobs that have expired or are temporarily suspended from receiving applications.
                    </Typography>
                  </Box>
                </TabPanel>
                <TabPanel
                  value="2"
                  sx={{ px: { xs: 0, sm: 1, md: 2, lg: 2, xl: 2 } }}
                >
                  {/* Start: AppliedJobCard */}
                  <AppliedJobCard />
                  {/* End: AppliedJobCard */}
                </TabPanel>
                <TabPanel value="3" sx={{ p: 0 }}>
                  {/* Start: JobPostNotificationCard */}
                  <JobPostNotificationCard />
                  {/* End: JobPostNotificationCard */}
                </TabPanel>
              </TabContext>
            </Box>
          </Card>
        </Stack>
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 12,
          md: 5,
          lg: 4,
          xl: 4
        }}>
        <Stack spacing={2}>
          <Card sx={{ p: { xs: 1, sm: 1, md: 2, lg: 2, xl: 2 } }}>
            <Stack>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6">Suitable Jobs</Typography>
              </Box>
              <Box>
                {/* Start: SuggestedJobPostCard */}
                <SuggestedJobPostCard fullWidth={true} />
                {/* End: SuggestedJobPostCardf */}
              </Box>
            </Stack>
          </Card>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default MyJobPage;
