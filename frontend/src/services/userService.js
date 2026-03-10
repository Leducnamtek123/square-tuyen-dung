import httpRequest from "../utils/httpRequest";

const userService = {
    getAllUsers: (params) => {
        const url = "auth/users/";
        return httpRequest.get(url, { params });
    },
    updateUser: (id, data) => {
        const url = `auth/users/${id}/`;
        return httpRequest.patch(url, data);
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
