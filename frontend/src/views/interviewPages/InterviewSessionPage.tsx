import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from "react-i18next";

import { App as VoiceAssistantApp } from "../../components/Features/VoiceAssistant/components/app/app";
import { APP_CONFIG_DEFAULTS } from "../../components/Features/VoiceAssistant/app-config";
import { cn } from "@/lib/utils";
import Button from "@mui/material/Button";
import { PreflightRoom } from "./PreflightRoom";

import interviewService from "../../services/interviewService";
import tokenService from "../../services/tokenService";
import { transformInterviewSession } from "../../utils/transformers";
import type { InterviewSession } from "../../types/models";

const getSafeLiveKitUrl = () => {
  if (typeof window === 'undefined') return '';
  
  const envUrl = (process.env.NEXT_PUBLIC_LIVEKIT_URL || "").trim();
  
  // If envUrl is set and specifies wss://, we MUST respect it regardless of local protocol
  if (envUrl.startsWith('wss://')) {
    return envUrl.replace(/\/$/, "");
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  
  // If envUrl is set and is absolute, use it (ensuring consistent protocol otherwise)
  if (envUrl && (envUrl.startsWith('http') || envUrl.startsWith('ws'))) {
    try {
      const url = new URL(envUrl);
      url.protocol = protocol;
      return url.toString().replace(/\/$/, "");
    } catch {
      // Fallback below
    }
  }

  // If envUrl is a relative path or empty, default to /livekit proxy
  const path = envUrl && envUrl.startsWith('/') ? envUrl : (envUrl || "/livekit");
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
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

const JOINABLE_STATUSES = ["scheduled", "calibration", "in_progress"];

const getErrorDetail = (err: unknown): string | null => {
  const maybeAxios = err as {
    response?: {
      data?: {
        errors?: {
          detail?: string[] | string;
        };
      };
    };
    message?: string;
  };

  const detail = maybeAxios?.response?.data?.errors?.detail;
  if (Array.isArray(detail) && detail.length > 0) return String(detail[0]);
  if (typeof detail === "string" && detail.trim()) return detail;
  if (maybeAxios?.message) return maybeAxios.message;
  return null;
};

const InterviewSessionPage = ({ role = "jobseeker" }: InterviewSessionPageProps) => {
  const normalizedRole = normalizeRole(role);
  const { id: routeId } = useParams<{ id?: string }>();
  const navigate = useRouter();
  const { t, i18n } = useTranslation(["interview", "common"]);

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [showPreflight, setShowPreflight] = useState(false);
  const [connectRoom, setConnectRoom] = useState(false);
  const [connectionDetails, setConnectionDetails] = useState<{
    token: string;
    serverUrl: string;
  } | undefined>(undefined);
  
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [sessionInviteToken, setSessionInviteToken] = useState<string>("");

  const roomName = session?.roomName;

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

  // Load initial session data
  const fetchSessionDetails = useCallback(async () => {
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
        if (!routeId) throw new Error(t("errors.missingSessionId", { defaultValue: "Missing session ID." }));
        detailRaw = await interviewService.getSessionDetail(routeId);
        inviteToken = detailRaw?.inviteToken || '';
      }

      const mappedSession = transformInterviewSession(detailRaw as InterviewSession & Record<string, unknown>) as InterviewSession;
      setSession(mappedSession);
      setSessionInviteToken(inviteToken || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.invalidSession"));
    } finally {
      setLoading(false);
    }
  }, [normalizedRole, routeId, t]);

  useEffect(() => {
    fetchSessionDetails();
  }, [fetchSessionDetails]);

  // Handle interview session initialization
  const initiateInterviewSession = useCallback(async () => {
    try {
      setStarting(true);
      setError("");

      if (!sessionInviteToken) {
        throw new Error(t("errors.missingInvite", { defaultValue: "Missing interview invite code." }));
      }

      // Refresh latest status right before connecting to avoid stale UI -> backend 400 mismatch.
      if (normalizedRole !== "jobseeker" && !routeId) {
        throw new Error(t("errors.missingSessionId", { defaultValue: "Missing session ID." }));
      }

      const latestRaw =
        normalizedRole === "jobseeker"
          ? await interviewService.getSessionDetailByInviteToken(sessionInviteToken)
          : await interviewService.getSessionDetail(routeId as string);
      const latestSession = transformInterviewSession(
        latestRaw as InterviewSession & Record<string, unknown>
      ) as InterviewSession;
      setSession(latestSession);

      if (!JOINABLE_STATUSES.includes(latestSession.status)) {
        throw new Error(
          t("errors.sessionNotReadyForJoin", {
            defaultValue: "Không thể vào phòng lúc này vì phiên đang ở trạng thái {{status}}.",
            status: t(`interviewListCard.statuses.${latestSession.status}`, {
              defaultValue: latestSession.status?.replaceAll("_", " "),
            }),
          })
        );
      }

      const tokenData = await interviewService.getLiveKitToken(sessionInviteToken);
      if (!tokenData?.token) {
        throw new Error(t("errors.tokenMissing", { defaultValue: "Connection token missing. Please try again." }));
      }

      let urlToUse = getSafeLiveKitUrl();
      const returnedUrl = tokenData.serverUrl || tokenData.server_url || tokenData.url;
      if (returnedUrl) {
        const isInternal = returnedUrl.includes('localhost') || returnedUrl.includes('127.0.0.1') || returnedUrl.includes('livekit:');
        if (!isInternal) {
          try {
            const url = new URL(returnedUrl);
            url.protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            urlToUse = url.toString().replace(/\/$/, "");
          } catch {}
        }
      }

      if (roomName && tokenService.getAccessTokenFromCookie()) {
        await interviewService.updateSessionStatus(roomName, "in_progress").catch((err) => {
          // Non-blocking error
        });
      }

      setConnectionDetails({
        token: tokenData.token,
        serverUrl: urlToUse
      });
      setConnectRoom(true);
    } catch (err) {
      setError(getErrorDetail(err) || t("errors.invalidSession", { defaultValue: "Cannot start interview." }));
    } finally {
      setStarting(false);
    }
  }, [normalizedRole, roomName, routeId, sessionInviteToken, t]);

  const terminateInterviewSession = useCallback(async () => {
    setConnectRoom(false);
    setConnectionDetails(undefined);
    try {
      if (roomName) {
        await interviewService.updateSessionStatus(roomName, "completed");
      }
    } catch {
      // Termination error is non-critical; session will timeout naturally
    }
  }, [roomName]);

  // Lifecycle Management
  // Removed unmount & beforeunload implicit completion so users can rejoin disconnected sessions
  useEffect(() => {
    if (!connectRoom) return;

    // We no longer trigger `completed` status automatically on tab close/unmount.
    // If the browser crashes, the session stays `in_progress` letting the candidate rejoin.
    // The session will be naturally completed if the user clicks "End Call" manually, 
    // or by backend max_duration timeout.
    
    return () => {
      // Intentionally kept empty - let the candidate rejoin if they reload or crash.
      // terminateInterviewSession() will still be called via explicitly clicking "End call".
    };
  }, [connectRoom]);

  const sessionInfo = useMemo(() => ({
    jobName: session?.jobName,
    candidateName: session?.candidateName,
  }), [session?.jobName, session?.candidateName]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-slate-100">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
          <p className="text-sm text-slate-300">{t("loading", { defaultValue: "Waiting for system..." })}</p>
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
    <main className="dark min-h-screen bg-slate-950 px-4 py-4 text-slate-100 md:px-8 md:py-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/40 p-4 backdrop-blur-2xl md:p-5 shadow-2xl shadow-black/50">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.1),transparent_60%)]" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                {sessionTitle}
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-400">
                {jobLabel} | {candidateLabel}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className={cn(
                "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] shadow-sm",
                statusClass
              )}>
                {statusText}
              </span>
              
              {connectRoom && (
                <>
                  <div className="h-6 w-[1px] bg-white/10" />
                  <Button 
                    variant="contained" 
                    color="error" 
                    onClick={terminateInterviewSession} 
                    className="h-9 rounded-xl px-4 text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95"
                  >
                    {t("controls.end", { defaultValue: "End call" })}
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        <section className="relative h-[75vh] min-h-[600px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#020617] shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-all duration-1000">
          {connectRoom && connectionDetails ? (
            <VoiceAssistantApp
              appConfig={{ 
                ...APP_CONFIG_DEFAULTS,
                supportsVideoInput: normalizedRole === "jobseeker",
                supportsChatInput: normalizedRole === "jobseeker"
              }}
              connectionDetails={connectionDetails}
              onDisconnect={terminateInterviewSession}
            />
          ) : showPreflight ? (
            <div className="relative flex h-full items-center justify-center px-6 transition-all duration-500">
               <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.15),transparent_52%)]" />
               <PreflightRoom 
                  onJoin={initiateInterviewSession} 
                  onCancel={() => setShowPreflight(false)} 
                  starting={starting} 
               />
            </div>
          ) : (
            <div className="relative flex h-full items-center justify-center px-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_52%)]" />
              <div className="relative flex w-full max-w-2xl flex-col items-center gap-10 text-center">
                <div className="relative group">
                  <div className="absolute inset-0 blur-[80px] rounded-full bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-all duration-1000" />
                  <div className="h-[220px] w-[220px] md:h-[320px] md:w-[320px] relative z-10 opacity-70 transition-all duration-1000 group-hover:opacity-100 flex items-center justify-center">
                     <span className="text-6xl">🤖</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                    {isJoinable
                      ? t("readyTitle", { defaultValue: "Ready to start interview" })
                      : t("sessionNotJoinable", { defaultValue: "Session Unavailable" })}
                  </h2>
                  {error && (
                    <p className="text-sm font-bold text-rose-400 uppercase tracking-widest">{error}</p>
                  )}
                  <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-400">
                    {isJoinable
                      ? t("readyBody", {
                          defaultValue: "Join the interview room. Your camera and microphone will only be shared when you choose.",
                        })
                      : t(`errors.unjoinableByStatus.${statusKey}`, {
                          defaultValue: t("sessionNotJoinableBody", {
                            defaultValue: "This interview session has already ended or been cancelled.",
                          }),
                        })}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-3">
                  {isJoinable ? (
                    <>
                      <Button
                        variant="contained"
                        onClick={() => setShowPreflight(true)}
                        disabled={starting}
                        className="h-14 rounded-2xl bg-cyan-500 px-12 text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-cyan-500/20 hover:bg-cyan-400 hover:shadow-cyan-400/30 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {starting
                          ? t("loading", { defaultValue: "Waiting for system..." })
                          : t("startInterview", { defaultValue: "Start Connecting" })}
                      </Button>
                      <Button
                        variant="text"
                        onClick={() => navigate.back()}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors"
                      >
                        {t("common:actions.back", { defaultValue: "Go back" })}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => navigate.push("/")}
                      className="h-12 rounded-2xl bg-slate-800 px-10 text-xs font-black uppercase tracking-widest shadow-xl hover:bg-slate-700 transition-all"
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
            {t("common:labels.time", { defaultValue: "Time" })} • {formattedSchedule}
          </p>
        )}
      </div>
    </main>
  );
};

export default InterviewSessionPage;
