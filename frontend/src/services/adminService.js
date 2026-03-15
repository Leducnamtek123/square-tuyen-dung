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

        // interview statistics for admin overview

        const url = 'interview/web/statistics/admin-general-statistics/';

        return httpRequest.get(url);

    },

};

export default adminService;
