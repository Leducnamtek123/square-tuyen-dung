// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  ConnectionStateToast,
} from "@livekit/components-react";

import InterviewAgentView from "../../components/interviewAi/InterviewAgentView";
import { AgentAudioVisualizerAura, StartAudioButton } from "../../components/agents-ui";
import Button from "@mui/material/Button";

import interviewService from "../../services/interviewService";
import { transformInterviewSession } from "../../utils/transformers";

interface Props {
  [key: string]: any;
}



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

const normalizeRole = (role: string) => {
  if (role === "admin") return "admin";
  if (role === "employer") return "employer";
  return "jobseeker";
};

const statusClassMap: Record<string, string> = {
  scheduled: "border-sky-400/30 bg-sky-500/15 text-sky-200",
  in_progress: "border-amber-400/30 bg-amber-500/15 text-amber-200",
  processing: "border-amber-400/30 bg-amber-500/15 text-amber-200",
  completed: "border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
  cancelled: "border-rose-400/30 bg-rose-500/15 text-rose-200",
};

type InterviewSessionPageProps = {
  role?: "jobseeker" | "employer" | "admin" | string;
};

const InterviewSessionPage = ({ role = "jobseeker" }: InterviewSessionPageProps) => {
  const AudioVisualizerAura = AgentAudioVisualizerAura as any;
  const normalizedRole = normalizeRole(role);
  const { id: routeId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(["interview", "common"]);

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [connectRoom, setConnectRoom] = useState(false);
  const [serverUrl, setServerUrl] = useState("");
  const [participantToken, setParticipantToken] = useState("");
  const [session, setSession] = useState<any>(null);

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

  const handleStartInterview = useCallback(async () => {
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
  }, [roomName]);

  const handleEndInterview = useCallback(async () => {
    setConnectRoom(false);
    try {
      if (roomName) {
        await interviewService.updateSessionStatus(roomName, "completed");
      }
    } catch (err) {
      console.error("Cannot update interview status to completed:", err);
    }
  }, [roomName]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-slate-100">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
          <p className="text-sm text-slate-300">{t("loading", { defaultValue: "Connecting..." })}</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-6">
        <section className="w-full max-w-lg rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 text-rose-100">
          <p className="text-sm">{error}</p>
          <Button className="mt-4" onClick={() => navigate("/")}>
            {t("common:actions.backHome", { defaultValue: "Back home" })}
          </Button>
        </section>
      </main>
    );
  }

  const statusText = (session?.status || "scheduled").replaceAll("_", " ");
  const statusKey = (session?.status || "scheduled").toLowerCase();
  const statusClass = statusClassMap[statusKey] || "border-white/15 bg-white/10 text-slate-200";
  const formattedSchedule =
    session?.scheduledAt &&
    new Date(session.scheduledAt).toLocaleString(i18n.language === "vi" ? "vi-VN" : "en-US");

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-4 text-slate-100 md:px-8 md:py-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-4 backdrop-blur-xl md:p-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.2),transparent_45%)]" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{sessionTitle}</h1>
              <p className="text-sm text-slate-300">
                {session?.jobName || "Interview"} | {session?.candidateName || "Candidate"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusClass}`}>
                {statusText}
              </span>
              <Button variant="outlined" onClick={() => navigate(-1)}>
                {t("common:actions.back", { defaultValue: "Back" })}
              </Button>
              {!connectRoom ? (
                <Button onClick={handleStartInterview} disabled={starting}>
                  {starting
                    ? t("loading", { defaultValue: "Connecting..." })
                    : t("startInterview", { defaultValue: "Start interview" })}
                </Button>
              ) : (
                <Button variant="contained" color="error" onClick={handleEndInterview}>
                  {t("controls.end", { defaultValue: "End call" })}
                </Button>
              )}
            </div>
          </div>
        </header>

        <section className="relative h-[calc(100vh-170px)] min-h-[560px] overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl shadow-black/30">
          <LiveKitRoom
            token={participantToken}
            serverUrl={liveKitUrl}
            connect={connectRoom}
            video={false}
            audio={true}
            data-lk-theme="default"
            onDisconnected={connectRoom ? handleEndInterview : undefined}
            className="h-full"
          >
            {connectRoom ? (
              <InterviewAgentView
                onDisconnect={handleEndInterview}
                sessionInfo={{
                  jobName: session?.jobName,
                  candidateName: session?.candidateName,
                }}
              />
            ) : (
              <div className="relative flex h-full items-center justify-center px-6">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_52%)]" />
                <div className="relative flex w-full max-w-lg flex-col items-center gap-6 text-center">
                  <AudioVisualizerAura
                    size="md"
                    state="listening"
                    className="h-[220px] w-[220px] md:h-[280px] md:w-[280px]"
                  />
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      {t("readyTitle", { defaultValue: "Ready to start interview" })}
                    </h2>
                    <p className="text-sm text-slate-300">
                      {t("readyBody", {
                        defaultValue:
                          "Click start to join the interview room with camera and microphone.",
                      })}
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
                    <StartAudioButton
                      label={t("controls.enableAudio", { defaultValue: "Enable audio" })}
                      variant="outline"
                      className="sm:min-w-[170px]"
                    />
                    <Button
                      onClick={handleStartInterview}
                      disabled={starting}
                      className="sm:min-w-[170px]"
                    >
                      {starting
                        ? t("loading", { defaultValue: "Connecting..." })
                        : t("startInterview", { defaultValue: "Start interview" })}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <RoomAudioRenderer />
            <ConnectionStateToast />
          </LiveKitRoom>
        </section>

        {formattedSchedule && (
          <p className="text-xs text-slate-300">
            {t("common:labels.time", { defaultValue: "Time" })}: {formattedSchedule}
          </p>
        )}
      </div>
    </main>
  );
};

export default InterviewSessionPage;
