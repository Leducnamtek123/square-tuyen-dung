import httpRequest from '../utils/httpRequest';
import type { PaginatedResponse } from '../types/api';
import type { QuestionGroup } from '../types/models';
import { cleanParams } from '../utils/params';
import { normalizePaginatedResponse, unwrapDataResponse } from '../utils/apiResponse';


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
      .get('interview/web/question-groups/', { params: cleanParams(params) })
      .then((data) => normalizePaginatedResponse<QuestionGroup>(data));
  },
  getQuestionGroupDetail: (id: IdType): Promise<QuestionGroup> => {
    return (httpRequest.get(`interview/web/question-groups/${id}/`) as Promise<unknown>)
      .then(unwrapDataResponse<QuestionGroup>);
  },
  createQuestionGroup: (data: QuestionGroupPayload): Promise<QuestionGroup> => {
    return (httpRequest.post('interview/web/question-groups/', data) as Promise<unknown>)
      .then(unwrapDataResponse<QuestionGroup>);
  },
  updateQuestionGroup: (id: IdType, data: Partial<QuestionGroupPayload>): Promise<QuestionGroup> => {
    return (httpRequest.patch(`interview/web/question-groups/${id}/`, data) as Promise<unknown>)
      .then(unwrapDataResponse<QuestionGroup>);
  },
  deleteQuestionGroup: (id: IdType): Promise<void> => {
    return httpRequest
      .delete(`interview/web/question-groups/${id}/`);
  },
};

export default questionGroupService;


