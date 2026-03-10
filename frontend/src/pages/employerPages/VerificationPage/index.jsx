import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Divider,
  Grid,
  TextField,
  Button,
  Chip,
  Alert,
  Snackbar,
  Stack,
} from "@mui/material";
import { TabTitle } from "../../../utils/generalFunction";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../configs/constants";

const VerificationPage = () => {
  TabTitle("Xac thuc nha tuyen dung");

  const navigate = useNavigate();
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
    if (requestedInterviews.length === 0) return "Chua co lich";
    return "Dang cho xac nhan";
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
        Xac thuc nha tuyen dung
      </Typography>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Buoc 1: Cap nhat ho so cong ty
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Hoan thien thong tin cong ty truoc khi nop ho so xac thuc. Admin se
          duyet noi dung nay truoc khi cap quyen dang tin.
        </Typography>
        <Box sx={{ mt: 2, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            onClick={() => navigate(`/${ROUTES.EMPLOYER.COMPANY}`)}
          >
            Mo trang thong tin cong ty
          </Button>
          <Chip label="Trang thai: Can cap nhat" color="warning" />
        </Box>
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Buoc 2: Ho so phap ly doanh nghiep
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
          Cung cap thong tin giay to phap ly de admin xac minh doanh nghiep.
        </Typography>
        <Box component="form" onSubmit={handleSaveLegalProfile}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Ten doanh nghiep"
                value={legalProfile.companyName}
                onChange={handleLegalProfileChange("companyName")}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Ma so thue"
                value={legalProfile.taxCode}
                onChange={handleLegalProfileChange("taxCode")}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="So giay phep kinh doanh"
                value={legalProfile.businessLicense}
                onChange={handleLegalProfileChange("businessLicense")}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nguoi dai dien"
                value={legalProfile.representative}
                onChange={handleLegalProfileChange("representative")}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="So dien thoai"
                value={legalProfile.phone}
                onChange={handleLegalProfileChange("phone")}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email lien he"
                value={legalProfile.email}
                onChange={handleLegalProfileChange("email")}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
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
              Luu ho so phap ly
            </Button>
            <Chip label="Trang thai: Cho duyet" color="info" />
          </Box>
        </Box>
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Buoc 3: Dang ky phong van online
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
          Admin se xac nhan lich phong van va gui thong tin tham gia phong.
        </Typography>
        <Box component="form" onSubmit={handleRequestInterview}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Thoi gian mong muon"
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
            <Grid item xs={12} md={6}>
              <TextField
                label="Nguoi lien he"
                value={interviewRequest.contactName}
                onChange={handleInterviewChange("contactName")}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="So dien thoai lien he"
                value={interviewRequest.contactPhone}
                onChange={handleInterviewChange("contactPhone")}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Ghi chu"
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
              Gui yeu cau phong van
            </Button>
            <Chip label={`Trang thai: ${interviewStatus}`} color="warning" />
          </Box>
        </Box>
      </Card>

      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Lich phong van da gui
        </Typography>
        <Divider sx={{ my: 2 }} />
        {requestedInterviews.length === 0 ? (
          <Alert severity="info">Chua co yeu cau phong van nao.</Alert>
        ) : (
          <Stack spacing={1.5}>
            {requestedInterviews.map((item) => (
              <Card key={item.id} variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {item.contactName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thoi gian de xuat: {dayjs(item.scheduledAt).format("HH:mm - DD/MM/YYYY")}
                </Typography>
                {item.contactPhone && (
                  <Typography variant="body2" color="text.secondary">
                    Lien he: {item.contactPhone}
                  </Typography>
                )}
                {item.notes && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Ghi chu: {item.notes}
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
          Da ghi nhan thong tin.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VerificationPage;
