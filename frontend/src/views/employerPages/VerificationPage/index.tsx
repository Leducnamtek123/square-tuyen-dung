import React, { useMemo, useState } from "react";
import { Box, Card, Typography, Divider, TextField, Button, Chip, Alert, Snackbar, Stack } from "@mui/material";
import Grid from "@mui/material/Grid2";

import { TabTitle } from "../../../utils/generalFunction";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from 'next/navigation';
import { ROUTES } from "../../../configs/constants";
import { useTranslation } from "react-i18next";

const makeId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

interface RequestedInterview {
    id: string;
    scheduledAt: Dayjs | null;
    contactName: string;
    contactPhone: string;
    notes: string;
}

const VerificationPage = () => {
    const { t } = useTranslation("employer");
    TabTitle(t("verification.title"));

    const navigateFunc = useRouter();
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
    const [interviewRequest, setInterviewRequest] = useState<{
        scheduledAt: Dayjs | null;
        contactName: string;
        contactPhone: string;
        notes: string;
    }>({
        scheduledAt: dayjs().add(2, "day"),
        contactName: "",
        contactPhone: "",
        notes: "",
    });
    const [requestedInterviews, setRequestedInterviews] = useState<RequestedInterview[]>([]);

    const interviewStatus = useMemo(() => {
        if (requestedInterviews.length === 0) return t("verification.messages.noScheduleYet");
        return t("verification.messages.waitingConfirmation");
    }, [requestedInterviews.length, t]);

    const handleLegalProfileChange = (field: keyof typeof legalProfile) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setLegalProfile((prev) => ({
            ...prev,
            [field]: event.target.value,
        }));
    };

    const handleInterviewChange = (field: keyof typeof interviewRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setInterviewRequest((prev) => ({
            ...prev,
            [field]: event.target.value,
        }));
    };

    const handleSaveLegalProfile = (event: React.FormEvent) => {
        event.preventDefault();
        setSnackbarOpen(true);
    };

    const handleRequestInterview = (event: React.FormEvent) => {
        event.preventDefault();
        if (!interviewRequest.scheduledAt || !interviewRequest.contactName) return;
        setRequestedInterviews((prev) => [
            {
                id: makeId(),
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
                {t("verification.title")}
            </Typography>
            <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t("verification.step1.title")}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {t("verification.step1.description")}
                </Typography>
                <Box sx={{ mt: 2, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                    <Button
                        variant="contained"
                        onClick={() => navigateFunc.push(`/${ROUTES.EMPLOYER.COMPANY}`)}
                    >
                        {t("verification.step1.openBtn")}
                    </Button>
                    <Chip label={t("verification.step1.statusRequired")} color="warning" />
                </Box>
            </Card>
            <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t("verification.step2.title")}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    {t("verification.step2.description")}
                </Typography>
                <Box component="form" onSubmit={handleSaveLegalProfile}>
                    <Grid container spacing={2}>
                        <Grid
                            size={{
                                xs: 12,
                                md: 6
                            }}>
                            <TextField
                                label={t("verification.step2.enterpriseName")}
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
                                label={t("verification.step2.taxCode")}
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
                                label={t("verification.step2.licenseNumber")}
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
                                label={t("verification.step2.representative")}
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
                                label={t("verification.step2.phone")}
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
                                label={t("verification.step2.email")}
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
                                label={t("verification.step2.website")}
                                value={legalProfile.website}
                                onChange={handleLegalProfileChange("website")}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 2, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                        <Button type="submit" variant="contained">
                            {t("verification.step2.saveBtn")}
                        </Button>
                        <Chip label={t("verification.step2.statusPending")} color="info" />
                    </Box>
                </Box>
            </Card>
            <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t("verification.step3.title")}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    {t("verification.step3.description")}
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
                                    label={t("verification.step3.timeLabel")}
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
                                label={t("verification.step3.contactPerson")}
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
                                label={t("verification.step3.contactPhone")}
                                value={interviewRequest.contactPhone}
                                onChange={handleInterviewChange("contactPhone")}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                label={t("verification.step3.notes")}
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
                            {t("verification.step3.sendRequestBtn")}
                        </Button>
                        <Chip label={t("verification.step3.statusLabel", { status: interviewStatus })} color="warning" />
                    </Box>
                </Box>
            </Card>
            <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t("verification.submittedSchedules.title")}
                </Typography>
                <Divider sx={{ my: 2 }} />
                {requestedInterviews.length === 0 ? (
                    <Alert severity="info">{t("verification.submittedSchedules.noRequests")}</Alert>
                ) : (
                    <Stack spacing={1.5}>
                        {requestedInterviews.map((item) => (
                            <Card key={item.id} variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {item.contactName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t("verification.submittedSchedules.proposedTime", { time: dayjs(item.scheduledAt).format("HH:mm - DD/MM/YYYY") })}
                                </Typography>
                                {item.contactPhone && (
                                    <Typography variant="body2" color="text.secondary">
                                        {t("verification.submittedSchedules.contact", { phone: item.contactPhone })}
                                    </Typography>
                                )}
                                {item.notes && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        {t("verification.submittedSchedules.notes", { notes: item.notes })}
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
                    {t("verification.messages.infoRecorded")}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default VerificationPage;
