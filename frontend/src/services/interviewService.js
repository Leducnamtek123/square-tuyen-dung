/*
MyJob Recruitment System - Part of MyJob Platform

Author: Antigravity (Google DeepMind)
*/

import httpRequest from '../utils/httpRequest';

const unwrapData = (response) => response?.data || response;

const interviewService = {
    getSessions: (params = {}) => {
        const url = 'interview/web/sessions/';
        return httpRequest.get(url, { params }).then(unwrapData);
    },
    getSessionDetail: (id) => {
        const url = `interview/web/sessions/${id}/`;
        return httpRequest.get(url).then(unwrapData);
    },
    getSessionDetailByInviteToken: (inviteToken) => {
        const url = `interview/web/sessions/invite/${inviteToken}/`;
        return httpRequest.get(url).then(unwrapData);
    },
    scheduleSession: (data) => {
        const url = 'interview/web/sessions/';
        return httpRequest.post(url, data).then(unwrapData);
    },
    updateSessionStatus: (roomName, status) => {
        const target = typeof roomName === 'object' ? roomName?.roomName : roomName;
        const url = `interview/web/sessions/${target}/status/`;
        return httpRequest.patch(url, { status }).then(unwrapData);
    },
    // Backend exposes LiveKit token by invite token, not by session id
    getLiveKitToken: (inviteToken) => {
        const url = `interview/web/sessions/invite/${inviteToken}/livekit-token/`;
        return httpRequest.get(url).then(unwrapData);
    },
    getLiveKitTokenByInviteToken: (inviteToken) => {
        const url = `interview/web/sessions/invite/${inviteToken}/livekit-token/`;
        return httpRequest.get(url).then(unwrapData);
    },
};

export default interviewService;
