import httpRequest from "../utils/httpRequest";

const unwrapData = (response) => response?.data || response;

const normalizeParams = (params = {}) => {
    const normalized = { ...params };

    if (normalized.page_size && !normalized.pageSize) {
        normalized.pageSize = normalized.page_size;
        delete normalized.page_size;
    }

    return normalized;
};

const questionGroupService = {
    getQuestionGroups: (params) => {
        return httpRequest.get('interview/web/question-groups/', { params: normalizeParams(params) }).then(unwrapData);
    },
    getQuestionGroupDetail: (id) => {
        return httpRequest.get(`interview/web/question-groups/${id}/`).then(unwrapData);
    },
    createQuestionGroup: (data) => {
        return httpRequest.post('interview/web/question-groups/', data).then(unwrapData);
    },
    updateQuestionGroup: (id, data) => {
        return httpRequest.patch(`interview/web/question-groups/${id}/`, data).then(unwrapData);
    },
    deleteQuestionGroup: (id) => {
        return httpRequest.delete(`interview/web/question-groups/${id}/`).then(unwrapData);
    }
};

export default questionGroupService;
