/*
MyJob Recruitment System - Part of MyJob Platform

Author: Antigravity (Google DeepMind)
*/

import httpRequest from '../utils/httpRequest';

const adminService = {
    // user-related admin endpoints
    getUsers: (params = {}) => {
        // backend does not expose a separate "admin" path for users;
        // the same `auth/users/` viewset is used and guarded by IsAdminUser
        // so we call the regular users endpoint.
        const url = 'auth/users/';
        return httpRequest.get(url, { params });
    },
    getStats: () => {
        // call the admin general statistics endpoint instead of non-existent interview stats
        const url = 'job/web/statistics/admin-general-statistics/';
        return httpRequest.get(url);
    },
};

export default adminService;
