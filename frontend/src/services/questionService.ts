import httpRequest from '../utils/httpRequest';
import type { PaginatedResponse } from '../types/api';
import type { Question } from '../types/models';


type IdType = string | number;

const normalizeParams = (params: Record<string, unknown> = {}): Record<string, unknown> => {
  const normalized: Record<string, unknown> = { ...params };

  if (normalized.page_size && !normalized.pageSize) {
    normalized.pageSize = normalized.page_size;
    delete normalized.page_size;
  }

  Object.keys(normalized).forEach((key) => {
    const value = normalized[key];
    if (value === undefined || value === null || value === '') {
      delete normalized[key];
    }
  });

  return normalized;
};

const questionService = {
  getQuestions: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<Question>> => {
    return httpRequest
      .get('interview/web/questions/', { params: normalizeParams(params) });
  },

  // Alias for better clarity in Admin contexts

  getAllQuestions: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<Question>> => {
    return httpRequest
      .get('interview/web/questions/', { params: normalizeParams(params) });
  },

  getQuestionDetail: (id: IdType): Promise<Question> => {
    return httpRequest.get(`interview/web/questions/${id}/`);
  },

  createQuestion: (data: Record<string, unknown>): Promise<Question> => {
    return httpRequest.post('interview/web/questions/', data);
  },

  updateQuestion: (id: IdType, data: Record<string, unknown>): Promise<Question> => {
    // Using PATCH for more flexible partial updates
    return httpRequest
      .patch(`interview/web/questions/${id}/`, data);
  },

  deleteQuestion: (id: IdType): Promise<void> => {
    return httpRequest.delete(`interview/web/questions/${id}/`);
  },
};

export default questionService;

