import React, { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import {
    LiveKitRoom,
    RoomAudioRenderer,
    GridLayout,
    ParticipantTile,
    useLocalParticipant,
    useRoomContext,
    useTracks,
    useChat,
} from "@livekit/components-react";

import "@livekit/components-styles";

import { Track } from "livekit-client";

import {
    Box,
    Typography,
    CircularProgress,
    Container,
    Paper,
    Button,
    Alert,
    Stack,
    IconButton,
    TextField,
    Divider,
} from "@mui/material";

import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import CallEndIcon from "@mui/icons-material/CallEnd";

import { useTranslation } from 'react-i18next';

import interviewService from "../../../services/interviewService";

const ToolbarButton = ({ active, label, onClick, children }) => (
    <Stack spacing={0.5} alignItems="center">
        <IconButton
            onClick={onClick}
            sx={{
                bgcolor: active ? "primary.main" : "rgba(255,255,255,0.08)",
                color: active ? "white" : "rgba(255,255,255,0.8)",
                '&:hover': { bgcolor: active ? 'primary.dark' : 'rgba(255,255,255,0.16)' },
                width: 44,
                height: 44,
            }}
        >
            {children}
        </IconButton>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {label}
        </Typography>
    </Stack>
);

const ChatPanel = ({ open, messages, onSend, onClose, t }) => {
    const [value, setValue] = useState("");

    if (!open) return null;

    const handleSubmit = (event) => {
        event.preventDefault();
        const trimmed = value.trim();
        if (!trimmed) return;
        onSend(trimmed);
        setValue("");
    };

    return (
        <Paper
            sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: { xs: '90vw', sm: 360 },
                maxHeight: '70vh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'rgba(15,23,42,0.9)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.12)',
                zIndex: 5,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{t('transcriptTitle')}</Typography>
                <Button size="small" color="inherit" onClick={onClose}>{t('common:actions.close')}</Button>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
            <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {messages.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {t('noMessages')}
                    </Typography>
                ) : (
                    messages.map((msg, idx) => (
                        <Paper
                            key={`${msg?.id || idx}`}
                            sx={{
                                p: 1,
                                bgcolor: msg.from?.isLocal ? 'rgba(56,189,248,0.15)' : 'rgba(148,163,184,0.12)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}
                            elevation={0}
                        >
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                {msg.from?.identity || (msg.from?.isLocal ? 'You' : 'AI')}
                            </Typography>
                            <Typography variant="body2">{msg.message}</Typography>
                        </Paper>
                    ))
                )}
            </Box>
            <Box component="form" onSubmit={handleSubmit} sx={{ p: 1.5, pt: 0 }}>
                <TextField
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    size="small"
                    placeholder={t('chatPlaceholder')}
                    fullWidth
                    InputProps={{
                        sx: {
                            bgcolor: 'rgba(255,255,255,0.06)',
                            color: 'white',
                            '& input': { color: 'white' },
                        },
                    }}
                />
            </Box>
        </Paper>
    );
};

const InterviewRoomInner = ({ onLeave }) => {
    const room = useRoomContext();
    const { isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant();
    const { messages, send } = useChat();
    const { t } = useTranslation('interview');

    const [chatOpen, setChatOpen] = useState(false);

    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: true },
        ],
        { onlySubscribed: false }
    );

    const handleToggleMic = () => {
        room.localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    };

    const handleToggleCamera = () => {
        room.localParticipant.setCameraEnabled(!isCameraEnabled);
    };

    const handleToggleScreenShare = () => {
        room.localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
    };

    const handleEndCall = () => {
        room.disconnect();
        onLeave();
    };

    const handleSendMessage = async (value) => {
        await send(value);
    };

    return (
        <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0b1020' }}>
            <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <GridLayout tracks={tracks} style={{ height: '100%', width: '100%' }}>
                    {(trackRef) => <ParticipantTile trackRef={trackRef} />}
                </GridLayout>
                <ChatPanel
                    open={chatOpen}
                    messages={messages}
                    onSend={handleSendMessage}
                    onClose={() => setChatOpen(false)}
                    t={t}
                />
            </Box>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Paper
                    sx={{
                        px: 2,
                        py: 1.5,
                        borderRadius: 999,
                        bgcolor: 'rgba(15,23,42,0.9)',
                        border: '1px solid rgba(255,255,255,0.12)',
                    }}
                    elevation={0}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <ToolbarButton
                            active={isMicrophoneEnabled}
                            label={t('controls.mic')}
                            onClick={handleToggleMic}
                        >
                            {isMicrophoneEnabled ? <MicIcon /> : <MicOffIcon />}
                        </ToolbarButton>
                        <ToolbarButton
                            active={isCameraEnabled}
                            label={t('controls.camera')}
                            onClick={handleToggleCamera}
                        >
                            {isCameraEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
                        </ToolbarButton>
                        <ToolbarButton
                            active={isScreenShareEnabled}
                            label={t('controls.share')}
                            onClick={handleToggleScreenShare}
                        >
                            {isScreenShareEnabled ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                        </ToolbarButton>
                        <ToolbarButton
                            active={chatOpen}
                            label={t('controls.chat')}
                            onClick={() => setChatOpen((prev) => !prev)}
                        >
                            <ChatIcon />
                        </ToolbarButton>
                        <Stack spacing={0.5} alignItems="center">
                            <IconButton
                                onClick={handleEndCall}
                                sx={{
                                    bgcolor: '#ef4444',
                                    color: 'white',
                                    '&:hover': { bgcolor: '#dc2626' },
                                    width: 44,
                                    height: 44,
                                }}
                            >
                                <CallEndIcon />
                            </IconButton>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                {t('controls.end')}
                            </Typography>
                        </Stack>
                    </Stack>
                </Paper>
            </Box>
        </Box>
    );
};

const InterviewRoomPage = () => {
    const { id: inviteToken } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation('interview');

    const [token, setToken] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [shouldConnect, setShouldConnect] = useState(false);

    const liveKitUrl = import.meta.env.VITE_LIVEKIT_URL || "ws://localhost:7880";

    useEffect(() => {
        const fetchToken = async () => {
            try {
                setLoading(true);
                const data = await interviewService.getLiveKitTokenByInviteToken(inviteToken);

                if (data && data.token) {
                    setToken(data.token);
                } else {
                    setError(t('errors.tokenMissing'));
                }
            } catch (err) {
                console.error("Fetch token error:", err);
                setError(t('errors.invalidSession'));
            } finally {
                setLoading(false);
            }
        };

        if (inviteToken) {
            fetchToken();
        } else {
            setError(t('errors.missingInvite'));
            setLoading(false);
        }
    }, [inviteToken, t]);

    const handleLeave = () => {
        navigate("/");
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2, bgcolor: "#0f172a", color: "white" }}>
                <CircularProgress />
                <Typography>{t('loading')}</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#0f172a" }}>
                <Container maxWidth="sm">
                    <Paper sx={{ p: 4, textAlign: "center", bgcolor: "rgba(255,255,255,0.05)", color: "white", borderRadius: 3, border: "1px solid rgba(255,255,255,0.08)" }}>
                        <Alert severity="error" variant="filled" sx={{ mb: 3 }}>{error}</Alert>
                        <Button variant="contained" onClick={() => navigate("/")}>{t('common:actions.backHome')}</Button>
                    </Paper>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ height: "100vh", width: "100vw" }}>
            <LiveKitRoom
                connect={shouldConnect}
                video={false}
                audio={false}
                token={token}
                serverUrl={liveKitUrl}
                data-lk-theme="default"
                onDisconnected={handleLeave}
                style={{ height: "100%", width: "100%" }}
            >
                {!shouldConnect && (
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            px: 2,
                            zIndex: 5,
                            bgcolor: "#0f172a",
                        }}
                    >
                        <Paper
                            sx={{
                                p: 4,
                                maxWidth: 520,
                                width: "100%",
                                textAlign: "center",
                                bgcolor: "rgba(255,255,255,0.06)",
                                color: "white",
                                borderRadius: 3,
                                border: "1px solid rgba(255,255,255,0.12)",
                            }}
                        >
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                {t('readyTitle')}
                            </Typography>
                            <Typography sx={{ color: "#cbd5e1", mb: 3 }}>
                                {t('readyBody')}
                            </Typography>
                            <Button variant="contained" size="large" onClick={() => setShouldConnect(true)}>
                                {t('startInterview')}
                            </Button>
                        </Paper>
                    </Box>
                )}
                <InterviewRoomInner onLeave={handleLeave} />
                <RoomAudioRenderer />
            </LiveKitRoom>
        </Box>
    );
};

export default InterviewRoomPage;
