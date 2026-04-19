import httpRequest from '../utils/httpRequest';
import type { PaginatedResponse } from '../types/api';
import type { QuestionGroup } from '../types/models';
import { cleanParams } from '../utils/params';


type IdType = string | number;
export type QuestionGroupListParams = {
  page?: number;
  pageSize?: number;
  ordering?: string;
  search?: string;
};

export interface QuestionGroupPayload {
  name: string;
  description?: string;
  evaluationRubricInput?: unknown;
  questionIds?: number[];
}

const questionGroupService = {
  getQuestionGroups: (params: QuestionGroupListParams = {}): Promise<PaginatedResponse<QuestionGroup>> => {
    return httpRequest
      .get('interview/web/question-groups/', { params: cleanParams(params) });
  },
  getQuestionGroupDetail: (id: IdType): Promise<QuestionGroup> => {
    return httpRequest
      .get(`interview/web/question-groups/${id}/`);
  },
  createQuestionGroup: (data: QuestionGroupPayload): Promise<QuestionGroup> => {
    return httpRequest
      .post('interview/web/question-groups/', data);
  },
  updateQuestionGroup: (id: IdType, data: Partial<QuestionGroupPayload>): Promise<QuestionGroup> => {
    return httpRequest
      .patch(`interview/web/question-groups/${id}/`, data);
  },
  deleteQuestionGroup: (id: IdType): Promise<void> => {
    return httpRequest
      .delete(`interview/web/question-groups/${id}/`);
  },
};

export default questionGroupService;


