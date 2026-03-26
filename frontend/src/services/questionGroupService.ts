import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

type IdType = string | number;

const normalizeParams = (params: AnyRecord = {}): AnyRecord => {
  const normalized: AnyRecord = { ...params };

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
  getQuestionGroups: (params: AnyRecord = {}): Promise<unknown> => {
    return httpRequest
      .get('interview/web/question-groups/', { params: normalizeParams(params) });
  },
  getQuestionGroupDetail: (id: IdType): Promise<unknown> => {
    return httpRequest
      .get(`interview/web/question-groups/${id}/`);
  },
  createQuestionGroup: (data: AnyRecord): Promise<unknown> => {
    return httpRequest
      .post('interview/web/question-groups/', data);
  },
  updateQuestionGroup: (id: IdType, data: AnyRecord): Promise<unknown> => {
    return httpRequest
      .patch(`interview/web/question-groups/${id}/`, data);
  },
  deleteQuestionGroup: (id: IdType): Promise<unknown> => {
    return httpRequest
      .delete(`interview/web/question-groups/${id}/`);
  },
};

export default questionGroupService;
