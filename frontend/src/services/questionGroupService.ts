import httpRequest from '../utils/httpRequest';
import type { PaginatedResponse } from '../types/api';
import type { QuestionGroup } from '../types/models';


type IdType = string | number;

const normalizeParams = (params: Record<string, unknown> = {}): Record<string, unknown> => {
  const normalized: Record<string, unknown> = { ...params };

  if (normalized.page_size && !normalized.pageSize) {
    normalized.pageSize = normalized.page_size;
    delete normalized.page_size;
  }

  if (normalized.kw && !normalized.search) {
    normalized.search = normalized.kw;
    delete normalized.kw;
  }

  Object.keys(normalized).forEach((key) => {
    const value = normalized[key];
    if (value === undefined || value === null || value === '') {
      delete normalized[key];
    }
  });

  return normalized;
};

const questionGroupService = {
  getQuestionGroups: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<QuestionGroup>> => {
    return httpRequest
      .get('interview/web/question-groups/', { params: normalizeParams(params) });
  },
  getQuestionGroupDetail: (id: IdType): Promise<QuestionGroup> => {
    return httpRequest
      .get(`interview/web/question-groups/${id}/`);
  },
  createQuestionGroup: (data: Record<string, unknown>): Promise<QuestionGroup> => {
    return httpRequest
      .post('interview/web/question-groups/', data);
  },
  updateQuestionGroup: (id: IdType, data: Record<string, unknown>): Promise<QuestionGroup> => {
    return httpRequest
      .patch(`interview/web/question-groups/${id}/`, data);
  },
  deleteQuestionGroup: (id: IdType): Promise<void> => {
    return httpRequest
      .delete(`interview/web/question-groups/${id}/`);
  },
};

export default questionGroupService;

