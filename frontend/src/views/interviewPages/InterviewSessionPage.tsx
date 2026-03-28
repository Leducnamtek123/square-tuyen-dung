import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from "react-i18next";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  ConnectionStateToast,
} from "@livekit/components-react";

import InterviewAgentView from "../../components/Features/InterviewAi/InterviewAgentView";
import { AgentAudioVisualizerAura, AuraShader } from "../../components/Features/AgentsUi";
import Button from "@mui/material/Button";

import interviewService from "../../services/interviewService";
import { transformInterviewSession } from "../../utils/transformers";

const getSafeLiveKitUrl = () => {
  if (typeof window === 'undefined') return '';
  
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  const defaultUrl = `${protocol}//${host}/livekit`;
  
  const rawUrl = (process.env.NEXT_PUBLIC_LIVEKIT_URL || "").trim();

  if (!rawUrl) return defaultUrl;

  // Handle absolute URLs
  if (rawUrl.startsWith('http') || rawUrl.startsWith('ws')) {
    try {
      const url = new URL(rawUrl);
      url.protocol = protocol;
      return url.toString().replace(/\/$/, "");
    } catch {
      return defaultUrl;
    }
  }
  
  // Handle relative or protocol-less URLs
  const cleanPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
  return `${protocol}//${host}${cleanPath}`.replace(/\/$/, "");
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
  const normalizedRole = normalizeRole(role);
  const { id: routeId } = useParams<{ id?: string }>();
  const navigate = useRouter();
  const { t, i18n } = useTranslation(["interview", "common"]);

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [connectRoom, setConnectRoom] = useState(false);
  const [serverUrl, setServerUrl] = useState("");
  const [participantToken, setParticipantToken] = useState("");
  const [session, setSession] = useState<any>(null);
  const [inviteTokenRef, setInviteTokenRef] = useState<string>("");

  const liveKitUrl = serverUrl || getSafeLiveKitUrl();
  const roomName = session?.room_name || session?.roomName;

  const JOINABLE_STATUSES = ["scheduled", "calibration", "in_progress"];
  const isJoinable = session && JOINABLE_STATUSES.includes(session.status);

  const sessionTitle = useMemo(() => {
    if (!isJoinable) {
      return t("unavailableTitle", { defaultValue: "Session Unavailable" });
    }
    if (normalizedRole === "jobseeker") {
      return t("readyTitle", { defaultValue: "Ready to start interview" });
    }
    return t("interviewDetail.title", { ns: "employer", defaultValue: "Interview session" });
  }, [normalizedRole, t, isJoinable]);

  // Step 1: Load session detail on page mount (no LiveKit token yet)
  const loadSessionDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let detailRaw;
      let inviteToken;

      if (normalizedRole === "jobseeker") {
        inviteToken = routeId;
        if (!inviteToken) throw new Error(t("errors.missingInvite"));
        detailRaw = await interviewService.getSessionDetailByInviteToken(inviteToken) as any;
      } else {
        if (!routeId) throw new Error(t("errors.missingSessionId", { defaultValue: "Missing session ID." }));
        detailRaw = await interviewService.getSessionDetail(routeId) as any;
        inviteToken = detailRaw?.invite_token || detailRaw?.inviteToken;
      }

      const mappedSession = transformInterviewSession(detailRaw);
      setSession(mappedSession);
      setInviteTokenRef(inviteToken || "");
    } catch (err: any) {
      setError(err?.message || t("errors.invalidSession"));
    } finally {
      setLoading(false);
    }
  }, [normalizedRole, routeId, t]);

  useEffect(() => {
    loadSessionDetail();
  }, [loadSessionDetail]);

  // Step 2: Fetch LiveKit token + start interview when user clicks Start
  const handleStartInterview = useCallback(async () => {
    try {
      setStarting(true);
      setError("");

      // Fetch LiveKit token at start time (not page load)
      if (!participantToken && inviteTokenRef) {
        const tokenData = await interviewService.getLiveKitToken(inviteTokenRef) as any;
        if (!tokenData?.token) {
          throw new Error(t("errors.tokenMissing", { defaultValue: "Cannot get connection token. Please try again." }));
        }
        setParticipantToken(tokenData.token);
        if (tokenData.serverUrl || tokenData.server_url) {
          const rawServerUrl = tokenData.serverUrl || tokenData.server_url;
          try {
            const url = new URL(rawServerUrl);
            url.protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            setServerUrl(url.toString().replace(/\/$/, ""));
          } catch {
            setServerUrl(rawServerUrl);
          }
        }
      }

      if (roomName) {
        await interviewService.updateSessionStatus(roomName, "in_progress").catch((err: unknown) => {
          console.error("Cannot update interview status before start:", err);
        });
      }

      setConnectRoom(true);
    } catch (err: any) {
      setError(err?.message || t("errors.invalidSession", { defaultValue: "Cannot start interview. Please try again." }));
    } finally {
      setStarting(false);
    }
  }, [roomName, participantToken, inviteTokenRef, t]);

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

  if (error && !session) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-6">
        <section className="w-full max-w-lg rounded-2xl border border-rose-400/30 bg-rose-500/10 p-8 text-center text-rose-100">
          <p className="mb-6 text-lg font-medium">{error}</p>
          <Button variant="contained" className="bg-rose-600 hover:bg-rose-700" onClick={() => navigate.push("/")}>
            {t("common:actions.backHome", { defaultValue: "Back home" })}
          </Button>
        </section>
      </main>
    );
  }

  const statusKey = (session?.status || "scheduled").toLowerCase();
  const statusText = t(`interviewListCard.statuses.${statusKey}`, { defaultValue: statusKey.replaceAll("_", " ") });
  const statusClass = statusClassMap[statusKey] || "border-white/15 bg-white/10 text-slate-200";
  const formattedSchedule =
    session?.scheduledAt &&
    new Date(session.scheduledAt).toLocaleString(i18n.language === "vi" ? "vi-VN" : "en-US");

  const jobLabel = session?.jobName || t("common:labels.job", { defaultValue: "Job" });
  const candidateLabel = session?.candidateName || t("interviewListCard.candidate", { defaultValue: "Candidate" });

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-4 text-slate-100 md:px-8 md:py-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-4 backdrop-blur-xl md:p-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.2),transparent_45%)]" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                {sessionTitle}
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-400">
                {jobLabel} | {candidateLabel}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>
                {statusText}
              </span>
              <div className="hidden h-6 w-[1px] bg-white/10 md:block" />
              <Button 
                variant="text" 
                color="inherit" 
                onClick={() => navigate.back()} 
                className="hidden text-slate-300 hover:text-white md:inline-flex"
              >
                {t("common:actions.back", { defaultValue: "Back" })}
              </Button>
              {!connectRoom && isJoinable && (
                <Button 
                  variant="contained" 
                  onClick={handleStartInterview} 
                  disabled={starting}
                  className="bg-cyan-500 font-semibold shadow-lg shadow-cyan-500/20 hover:bg-cyan-600"
                >
                  {starting
                    ? t("loading", { defaultValue: "Connecting..." })
                    : t("startInterview", { defaultValue: "Start interview" })}
                </Button>
              )}
              {connectRoom && (
                <Button variant="contained" color="error" onClick={handleEndInterview} className="font-semibold shadow-lg shadow-rose-500/20">
                  {t("controls.end", { defaultValue: "End call" })}
                </Button>
              )}
            </div>
          </div>
        </header>

        <section className="relative h-[72vh] min-h-[500px] overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl shadow-black/30">
          {connectRoom && participantToken ? (
            <LiveKitRoom
              token={participantToken}
              serverUrl={liveKitUrl}
              connect={connectRoom}
              video={false}
              audio={true}
              data-lk-theme="default"
              onDisconnected={handleEndInterview}
              className="h-full"
            >
              <InterviewAgentView
                onDisconnect={handleEndInterview}
                sessionInfo={{
                  jobName: session?.jobName,
                  candidateName: session?.candidateName,
                }}
              />
              <RoomAudioRenderer />
              <ConnectionStateToast />
            </LiveKitRoom>
          ) : (
            <div className="relative flex h-full items-center justify-center px-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_52%)]" />
              <div className="relative flex w-full max-w-lg flex-col items-center gap-6 text-center">
                <AgentAudioVisualizerAura
                  size="md"
                  state="listening"
                  isStatic={true}
                  className="h-[220px] w-[220px] md:h-[280px] md:w-[280px]"
                />
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {isJoinable
                      ? (normalizedRole === "jobseeker"
                        ? t("readyBody", { defaultValue: "Press start to connect. Camera and microphone will only turn on when you select them on the toolbar." })
                        : t("readyTitle", { defaultValue: "Ready to start interview" }))
                      : t("sessionNotJoinable", { defaultValue: "This interview session has already ended or been cancelled." })}
                  </h2>
                  {error && (
                    <p className="text-sm text-rose-300">{error}</p>
                  )}
                  <p className="text-sm text-slate-300">
                    {isJoinable
                      ? t("readyBody", {
                          defaultValue:
                            "Click start to join the interview room with camera and microphone.",
                        })
                      : t("sessionNotJoinableBody", {
                          defaultValue:
                            "This interview session has already ended or been cancelled.",
                        })}
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
                  {isJoinable ? (
                    <Button
                      variant="contained"
                      onClick={handleStartInterview}
                      disabled={starting}
                      className="bg-cyan-500 px-8 py-2.5 font-bold shadow-xl shadow-cyan-500/20 hover:bg-cyan-600 sm:min-w-[200px]"
                    >
                      {starting
                        ? t("loading", { defaultValue: "Connecting..." })
                        : t("startInterview", { defaultValue: "Start interview" })}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => navigate.push("/")}
                      className="bg-slate-700 px-8 py-2.5 font-bold shadow-xl shadow-slate-900/40 hover:bg-slate-600 sm:min-w-[200px]"
                    >
                      {t("common:actions.backHome", { defaultValue: "Back home" })}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
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
