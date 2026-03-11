import React, { useMemo, useState } from "react";
import { Box, Card, Typography, Divider, TextField, Button, Chip, Alert, Snackbar, Stack } from "@mui/material";
import Grid from "@mui/material/Grid2";

import { TabTitle } from "../../../utils/generalFunction";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../configs/constants";

const VerificationPage = () => {
  TabTitle("Employer Verification");

  const navigate = navigate; // This was incorrectly named in original, but I'll fix it if needed. Wait, it's 'useNavigate' return value.
  const navigateFunc = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [legalProfile, setLegalProfile] = useState({
    companyName: "",
    taxCode: "",
    businessLicense: "",
    representative: "",
    phone: "",
    email: "",
    website: "",
  });
  const [interviewRequest, setInterviewRequest] = useState({
    scheduledAt: dayjs().add(2, "day"),
    contactName: "",
    contactPhone: "",
    notes: "",
  });
  const [requestedInterviews, setRequestedInterviews] = useState([]);

  const interviewStatus = useMemo(() => {
    if (requestedInterviews.length === 0) return "No schedule yet";
    return "Waiting for confirmation";
  }, [requestedInterviews.length]);

  const handleLegalProfileChange = (field) => (event) => {
    setLegalProfile((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleInterviewChange = (field) => (event) => {
    setInterviewRequest((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSaveLegalProfile = (event) => {
    event.preventDefault();
    setSnackbarOpen(true);
  };

  const handleRequestInterview = (event) => {
    event.preventDefault();
    if (!interviewRequest.scheduledAt || !interviewRequest.contactName) return;
    setRequestedInterviews((prev) => [
      {
        id: Date.now(),
        scheduledAt: interviewRequest.scheduledAt,
        contactName: interviewRequest.contactName,
        contactPhone: interviewRequest.contactPhone,
        notes: interviewRequest.notes,
      },
      ...prev,
    ]);
    setInterviewRequest((prev) => ({
      ...prev,
      contactName: "",
      contactPhone: "",
      notes: "",
    }));
    setSnackbarOpen(true);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Employer Verification
      </Typography>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Step 1: Update Company Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Complete company information before submitting verification documents. Admin will review this content before granting posting rights.
        </Typography>
        <Box sx={{ mt: 2, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            onClick={() => navigateFunc(`/${ROUTES.EMPLOYER.COMPANY}`)}
          >
            Open Company Information Page
          </Button>
          <Chip label="Status: Update Required" color="warning" />
        </Box>
      </Card>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Step 2: Enterprise Legal Documents
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
          Provide legal document information for admin to verify the enterprise.
        </Typography>
        <Box component="form" onSubmit={handleSaveLegalProfile}>
          <Grid container spacing={2}>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
                label="Enterprise Name"
                value={legalProfile.companyName}
                onChange={handleLegalProfileChange("companyName")}
                fullWidth
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
                label="Tax Code"
                value={legalProfile.taxCode}
                onChange={handleLegalProfileChange("taxCode")}
                fullWidth
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
                label="Business License Number"
                value={legalProfile.businessLicense}
                onChange={handleLegalProfileChange("businessLicense")}
                fullWidth
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
                label="Representative"
                value={legalProfile.representative}
                onChange={handleLegalProfileChange("representative")}
                fullWidth
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
                label="Phone Number"
                value={legalProfile.phone}
                onChange={handleLegalProfileChange("phone")}
                fullWidth
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
                label="Contact Email"
                value={legalProfile.email}
                onChange={handleLegalProfileChange("email")}
                fullWidth
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
                label="Website"
                value={legalProfile.website}
                onChange={handleLegalProfileChange("website")}
                fullWidth
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button type="submit" variant="contained">
              Save Legal Documents
            </Button>
            <Chip label="Status: Pending Approval" color="info" />
          </Box>
        </Box>
      </Card>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Step 3: Register for Online Interview
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
          Admin will confirm the interview schedule and send room participation information.
        </Typography>
        <Box component="form" onSubmit={handleRequestInterview}>
          <Grid container spacing={2}>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Desired Time"
                  value={interviewRequest.scheduledAt}
                  onChange={(value) =>
                    setInterviewRequest((prev) => ({
                      ...prev,
                      scheduledAt: value,
                    }))
                  }
                  minDateTime={dayjs()}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
                label="Contact Person"
                value={interviewRequest.contactName}
                onChange={handleInterviewChange("contactName")}
                fullWidth
                required
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
                label="Contact Phone Number"
                value={interviewRequest.contactPhone}
                onChange={handleInterviewChange("contactPhone")}
                fullWidth
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Notes"
                value={interviewRequest.notes}
                onChange={handleInterviewChange("notes")}
                multiline
                rows={3}
                fullWidth
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button type="submit" variant="contained">
              Send Interview Request
            </Button>
            <Chip label={`Status: ${interviewStatus}`} color="warning" />
          </Box>
        </Box>
      </Card>
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Submitted Interview Schedules
        </Typography>
        <Divider sx={{ my: 2 }} />
        {requestedInterviews.length === 0 ? (
          <Alert severity="info">No interview requests yet.</Alert>
        ) : (
          <Stack spacing={1.5}>
            {requestedInterviews.map((item) => (
              <Card key={item.id} variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {item.contactName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Proposed Time: {dayjs(item.scheduledAt).format("HH:mm - DD/MM/YYYY")}
                </Typography>
                {item.contactPhone && (
                  <Typography variant="body2" color="text.secondary">
                    Contact: {item.contactPhone}
                  </Typography>
                )}
                {item.notes && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Notes: {item.notes}
                  </Typography>
                )}
              </Card>
            ))}
          </Stack>
        )}
      </Card>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" variant="filled">
          Information recorded.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VerificationPage;
