/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Edited by: Antigravity (Google DeepMind)
*/

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

const questionService = {
    getQuestions: (params) => {
        return httpRequest.get('interview/web/questions/', { params: normalizeParams(params) }).then(unwrapData);
    },
    // Alias for better clarity in Admin contexts
    getAllQuestions: (params) => {
        return httpRequest.get('interview/web/questions/', { params: normalizeParams(params) }).then(unwrapData);
    },
    getQuestionDetail: (id) => {
        return httpRequest.get(`interview/web/questions/${id}/`).then(unwrapData);
    },
    createQuestion: (data) => {
        return httpRequest.post('interview/web/questions/', data).then(unwrapData);
    },
    updateQuestion: (id, data) => {
        // Using PATCH for more flexible partial updates
        return httpRequest.patch(`interview/web/questions/${id}/`, data).then(unwrapData);
    },
    deleteQuestion: (id) => {
        return httpRequest.delete(`interview/web/questions/${id}/`).then(unwrapData);
    }
};

export default questionService;
