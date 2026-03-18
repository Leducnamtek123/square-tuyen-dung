import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

type IdType = string | number;

const unwrapData = (response: { data?: unknown } | unknown): unknown =>
  (response as { data?: unknown })?.data ?? response;

const normalizeParams = (params: AnyRecord = {}): AnyRecord => {
  const normalized: AnyRecord = { ...params };

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
  getQuestions: (params: AnyRecord = {}): Promise<unknown> => {
    return httpRequest
      .get('interview/web/questions/', { params: normalizeParams(params) })
      .then(unwrapData);
  },

  // Alias for better clarity in Admin contexts

  getAllQuestions: (params: AnyRecord = {}): Promise<unknown> => {
    return httpRequest
      .get('interview/web/questions/', { params: normalizeParams(params) })
      .then(unwrapData);
  },

  getQuestionDetail: (id: IdType): Promise<unknown> => {
    return httpRequest.get(`interview/web/questions/${id}/`).then(unwrapData);
  },

  createQuestion: (data: AnyRecord): Promise<unknown> => {
    return httpRequest.post('interview/web/questions/', data).then(unwrapData);
  },

  updateQuestion: (id: IdType, data: AnyRecord): Promise<unknown> => {
    // Using PATCH for more flexible partial updates
    return httpRequest
      .patch(`interview/web/questions/${id}/`, data)
      .then(unwrapData);
  },

  deleteQuestion: (id: IdType): Promise<unknown> => {
    return httpRequest.delete(`interview/web/questions/${id}/`).then(unwrapData);
  },
};

export default questionService;
