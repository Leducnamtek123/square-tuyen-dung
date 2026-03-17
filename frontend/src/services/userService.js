import httpRequest from "../utils/httpRequest";
import { presignInObject } from "../utils/presignUrl";

const withPresign = async (promise) => {
    const data = await promise;
    return presignInObject(data);
};

const userService = {
    getAllUsers: (params) => {
        const url = "auth/users/";
        return withPresign(httpRequest.get(url, { params }));
    },
    updateUser: (id, data) => {
        const url = `auth/users/${id}/`;
        return withPresign(httpRequest.patch(url, data));
    },
    toggleUserStatus: (id) => {
        const url = `auth/users/${id}/toggle-active/`;
        return httpRequest.post(url);
    },
    deleteUser: (id) => {
        const url = `auth/users/${id}/`;
        return httpRequest.delete(url);
    }
};

export default userService;
