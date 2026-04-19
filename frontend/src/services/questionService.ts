import httpRequest from '../utils/httpRequest';
import type { PaginatedResponse } from '../types/api';
import type { Question } from '../types/models';
import { cleanParams } from '../utils/params';


type IdType = string | number;
export type QuestionListParams = {
  page?: number;
  pageSize?: number;
  ordering?: string;
  search?: string;
};

export interface QuestionPayload {
  text: string;
  difficulty?: string;
  career?: number | null;
}

const questionService = {
  getQuestions: (params: QuestionListParams = {}): Promise<PaginatedResponse<Question>> => {
    return httpRequest
      .get('interview/web/questions/', { params: cleanParams(params) });
  },

  // Alias for better clarity in Admin contexts

  getAllQuestions: (params: QuestionListParams = {}): Promise<PaginatedResponse<Question>> => {
    return httpRequest
      .get('interview/web/questions/', { params: cleanParams(params) });
  },

  getQuestionDetail: (id: IdType): Promise<Question> => {
    return httpRequest.get(`interview/web/questions/${id}/`);
  },

  createQuestion: (data: QuestionPayload): Promise<Question> => {
    return httpRequest.post('interview/web/questions/', data);
  },

  updateQuestion: (id: IdType, data: Partial<QuestionPayload>): Promise<Question> => {
    // Using PATCH for more flexible partial updates
    return httpRequest
      .patch(`interview/web/questions/${id}/`, data);
  },

  deleteQuestion: (id: IdType): Promise<void> => {
    return httpRequest.delete(`interview/web/questions/${id}/`);
  },
};

export default questionService;


