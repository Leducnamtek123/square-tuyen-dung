import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';

const withPresign = async (promise) => {
    const data = await promise;
    return presignInObject(data);
};

const adminService = {

    // user-related admin endpoints

    getUsers: (params = {}) => {

        // backend does not expose a separate "admin" path for users;

        // the same `auth/users/` viewset is used and guarded by IsAdminUser

        // so we call the regular users endpoint.

        const url = 'auth/users/';

        return withPresign(httpRequest.get(url, { params }));

    },

    getStats: () => {

        // interview statistics for admin overview

        const url = 'interview/web/statistics/admin-general-statistics/';

        return withPresign(httpRequest.get(url));

    },

};

export default adminService;
