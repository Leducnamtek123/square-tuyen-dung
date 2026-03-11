import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, CircularProgress, Container, Paper, Alert, Typography, Button } from "@mui/material";

import { useTranslation } from "react-i18next";
import { TokenSource } from "livekit-client";

import "@/voice-ai/styles/globals.css";

import interviewService from "../../../services/interviewService";
import { App as VoiceAiApp } from "@/voice-ai/components/app/app";
import { ThemeProvider } from "@/voice-ai/components/app/theme-provider";
import { APP_CONFIG_DEFAULTS } from "@/voice-ai/app-config";

const InterviewRoomPage = () => {
  const { id: inviteToken } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("interview");

  const [token, setToken] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const liveKitUrl = import.meta.env.VITE_LIVEKIT_URL || "ws://localhost:7880";

  useEffect(() => {
    const fetchToken = async () => {
      try {
        setLoading(true);
        const data = await interviewService.getLiveKitTokenByInviteToken(inviteToken);

        if (data?.token) {
          setToken(data.token);
        } else {
          setError(t("errors.tokenMissing"));
        }
      } catch (err) {
        console.error("Fetch token error:", err);
        setError(t("errors.invalidSession"));
      } finally {
        setLoading(false);
      }
    };

    if (inviteToken) {
      fetchToken();
    } else {
      setError(t("errors.missingInvite"));
      setLoading(false);
    }
  }, [inviteToken, t]);

  const handleBackHome = () => {
    navigate("/");
  };

  const tokenSource = useMemo(() => {
    if (!token) return null;
    return TokenSource.literal({
      serverUrl: liveKitUrl,
      participantToken: token,
    });
  }, [token, liveKitUrl]);

  const appConfig = useMemo(
    () => ({
      ...APP_CONFIG_DEFAULTS,
      pageTitle: t("voiceAi.pageTitle"),
      pageDescription: t("voiceAi.pageDescription"),
      companyName: t("voiceAi.companyName"),
      startButtonText: t("voiceAi.startCall"),
    }),
    [t]
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
          bgcolor: "#0f172a",
          color: "white",
        }}
      >
        <CircularProgress />
        <Typography>{t("loading")}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#0f172a",
        }}
      >
        <Container maxWidth="sm">
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              bgcolor: "rgba(255,255,255,0.05)",
              color: "white",
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Alert severity="error" variant="filled" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Button variant="contained" onClick={handleBackHome}>
              {t("common:actions.backHome")}
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (!tokenSource) {
    return null;
  }

  return (
    <Box sx={{ height: "100vh", width: "100vw", bgcolor: "#0f172a" }}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <VoiceAiApp
          appConfig={appConfig}
          tokenSource={tokenSource}
          startAudioLabel={t("voiceAi.startAudio")}
        />
      </ThemeProvider>
    </Box>
  );
};

export default InterviewRoomPage;
