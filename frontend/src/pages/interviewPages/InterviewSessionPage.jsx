import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VideoCameraFrontIcon from "@mui/icons-material/VideoCameraFront";
import StopCircleIcon from "@mui/icons-material/StopCircle";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoConference,
  ConnectionStateToast,
} from "@livekit/components-react";

import interviewService from "../../services/interviewService";
import { transformInterviewSession } from "../../utils/transformers";

const getSafeLiveKitUrl = () => {
  const defaultUrl = `${window.location.protocol}//${window.location.host}/livekit`;
  const rawUrl = (import.meta.env.VITE_LIVEKIT_URL || defaultUrl).trim();

  if (!rawUrl) return defaultUrl;

  try {
    const normalized = new URL(rawUrl);
    normalized.protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return normalized.toString().replace(/\/$/, "");
  } catch {
    return defaultUrl;
  }
};

const normalizeRole = (role) => {
  if (role === "admin") return "admin";
  if (role === "employer") return "employer";
  return "jobseeker";
};

const statusColorMap = {
  scheduled: "info",
  in_progress: "warning",
  processing: "warning",
  completed: "success",
  cancelled: "error",
};

const InterviewSessionPage = ({ role = "jobseeker" }) => {
  const normalizedRole = normalizeRole(role);
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(["interview", "common"]);

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [connectRoom, setConnectRoom] = useState(false);
  const [serverUrl, setServerUrl] = useState("");
  const [participantToken, setParticipantToken] = useState("");
  const [session, setSession] = useState(null);

  const liveKitUrl = serverUrl || getSafeLiveKitUrl();
  const roomName = session?.room_name || session?.roomName;

  const sessionTitle = useMemo(() => {
    if (normalizedRole === "jobseeker") {
      return t("readyTitle", { defaultValue: "Ready to start interview" });
    }
    return t("interviewDetail.title", { ns: "employer", defaultValue: "Interview session" });
  }, [normalizedRole, t]);

  const resolveSessionAndToken = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let detailRaw;
      let inviteToken;

      if (normalizedRole === "jobseeker") {
        inviteToken = routeId;
        if (!inviteToken) throw new Error(t("errors.missingInvite"));
        detailRaw = await interviewService.getSessionDetailByInviteToken(inviteToken);
      } else {
        if (!routeId) throw new Error("Missing session id.");
        detailRaw = await interviewService.getSessionDetail(routeId);
        inviteToken = detailRaw?.invite_token || detailRaw?.inviteToken;
      }

      if (!inviteToken) {
        throw new Error(t("errors.tokenMissing"));
      }

      const tokenData = await interviewService.getLiveKitTokenByInviteToken(inviteToken);
      const mappedSession = transformInterviewSession(detailRaw);

      if (!tokenData?.token) {
        throw new Error(t("errors.tokenMissing"));
      }

      setSession(mappedSession);
      setParticipantToken(tokenData.token);
      if (tokenData.server_url) {
        setServerUrl(tokenData.server_url);
      }
    } catch (err) {
      setError(err?.message || t("errors.invalidSession"));
    } finally {
      setLoading(false);
    }
  }, [normalizedRole, routeId, t]);

  useEffect(() => {
    resolveSessionAndToken();
  }, [resolveSessionAndToken]);

  const handleStartInterview = async () => {
    try {
      setStarting(true);
      if (roomName) {
        await interviewService.updateSessionStatus(roomName, "in_progress");
      }
    } catch (err) {
      console.error("Cannot update interview status before start:", err);
    } finally {
      setConnectRoom(true);
      setStarting(false);
    }
  };

  const handleEndInterview = async () => {
    setConnectRoom(false);
    try {
      if (roomName) {
        await interviewService.updateSessionStatus(roomName, "completed");
      }
    } catch (err) {
      console.error("Cannot update interview status to completed:", err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "#0b1220" }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography color="white">{t("loading", { defaultValue: "Connecting..." })}</Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "#0b1220", px: 2 }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Stack spacing={2}>
              <Alert severity="error">{error}</Alert>
              <Button variant="contained" onClick={() => navigate("/")}>
                {t("common:actions.backHome", { defaultValue: "Back home" })}
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0b1220", py: 2, px: 2 }}>
      <Container maxWidth="xl">
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Stack spacing={0.5}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {sessionTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {session?.jobName || "Interview"} | {session?.candidateName || "Candidate"}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Chip
                size="small"
                label={(session?.status || "scheduled").replaceAll("_", " ")}
                color={statusColorMap[session?.status] || "default"}
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
              >
                {t("common:actions.back", { defaultValue: "Back" })}
              </Button>
              {!connectRoom ? (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<VideoCameraFrontIcon />}
                  onClick={handleStartInterview}
                  disabled={starting}
                >
                  {t("startInterview", { defaultValue: "Start interview" })}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  startIcon={<StopCircleIcon />}
                  onClick={handleEndInterview}
                >
                  {t("controls.end", { defaultValue: "End call" })}
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Stack spacing={2}>
            {!connectRoom && (
              <>
                <Alert severity="info">
                  {t("readyBody", {
                    defaultValue: "Click start to join the interview room with camera and microphone.",
                  })}
                </Alert>
                <Divider />
              </>
            )}

            <Box sx={{ height: { xs: 520, md: 680 }, borderRadius: 2, overflow: "hidden", bgcolor: "#0f172a" }}>
              <LiveKitRoom
                token={participantToken}
                serverUrl={liveKitUrl}
                connect={connectRoom}
                video
                audio
                data-lk-theme="default"
                onDisconnected={handleEndInterview}
              >
                <ConnectionStateToast />
                <VideoConference chatMessageFormatter={(msg) => `${msg?.from?.identity || "User"}: ${msg?.message}`} />
                <RoomAudioRenderer />
              </LiveKitRoom>
            </Box>
          </Stack>
        </Paper>

        {session?.scheduledAt && (
          <Typography variant="caption" sx={{ mt: 1, display: "block", color: "rgba(255,255,255,0.75)" }}>
            {t("common:labels.time", { defaultValue: "Time" })}:{" "}
            {new Date(session.scheduledAt).toLocaleString(i18n.language === "vi" ? "vi-VN" : "en-US")}
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default InterviewSessionPage;
