import httpRequest from '../utils/httpRequest';

const adminSettingsService = {
    getSystemSettings: () => {
        // assuming a new endpoint for system settings
        const url = 'admin/web/system-settings/';
        return httpRequest.get(url);
    },
    updateSystemSettings: (data) => {
        const url = 'admin/web/system-settings/';
        return httpRequest.put(url, data);
    },
};

export default adminSettingsService;