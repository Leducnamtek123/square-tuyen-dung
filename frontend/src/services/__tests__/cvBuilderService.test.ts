import { cvBuilderService } from '../cvBuilderService';
import httpRequest from '../../utils/httpRequest';

jest.mock('../../utils/httpRequest', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('cvBuilderService Client Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTemplates', () => {
    it('calls GET cv/templates/ with cleaned params', async () => {
      (httpRequest.get as jest.Mock).mockResolvedValueOnce({
        data: { results: [{ id: 1, code: 'modern-navy' }] },
      });

      const params = { category: 'modern', search: 'navy' };
      const res = await cvBuilderService.getTemplates(params);

      expect(httpRequest.get).toHaveBeenCalledWith('cv/templates/', {
        params: { category: 'modern', search: 'navy' },
      });
      expect(res).toBeDefined();
    });
  });

  describe('getTemplateDetail', () => {
    it('calls GET cv/templates/:idOrCode/', async () => {
      (httpRequest.get as jest.Mock).mockResolvedValueOnce({
        data: { id: 1, code: 'modern-navy' },
      });

      await cvBuilderService.getTemplateDetail('modern-navy');
      expect(httpRequest.get).toHaveBeenCalledWith('cv/templates/modern-navy/');
    });
  });

  describe('getCandidateCVs', () => {
    it('calls GET cv/candidate-cvs/ with params', async () => {
      (httpRequest.get as jest.Mock).mockResolvedValueOnce({
        data: { results: [] },
      });

      await cvBuilderService.getCandidateCVs({ search: 'React' });
      expect(httpRequest.get).toHaveBeenCalledWith('cv/candidate-cvs/', {
        params: { search: 'React' },
      });
    });
  });

  describe('getCandidateCVDetail', () => {
    it('calls GET cv/candidate-cvs/:id/', async () => {
      (httpRequest.get as jest.Mock).mockResolvedValueOnce({
        data: { id: 42, title: 'My React CV' },
      });

      await cvBuilderService.getCandidateCVDetail(42);
      expect(httpRequest.get).toHaveBeenCalledWith('cv/candidate-cvs/42/');
    });
  });

  describe('createCandidateCV', () => {
    it('calls POST cv/candidate-cvs/ with payload', async () => {
      const payload = {
        template_code: 'modern-navy',
        title: 'New CV',
        theme_config: {},
        cv_data: { personalInfo: { fullName: 'Nguyen Van A' } } as any,
      };
      (httpRequest.post as jest.Mock).mockResolvedValueOnce({
        data: { id: 100, ...payload },
      });

      await cvBuilderService.createCandidateCV(payload);
      expect(httpRequest.post).toHaveBeenCalledWith('cv/candidate-cvs/', payload);
    });
  });

  describe('updateCandidateCV', () => {
    it('calls PATCH cv/candidate-cvs/:id/ with partial payload', async () => {
      const payload = { title: 'Updated Title' };
      (httpRequest.patch as jest.Mock).mockResolvedValueOnce({
        data: { id: 100, title: 'Updated Title' },
      });

      await cvBuilderService.updateCandidateCV(100, payload);
      expect(httpRequest.patch).toHaveBeenCalledWith('cv/candidate-cvs/100/', payload);
    });
  });

  describe('duplicateCandidateCV', () => {
    it('calls POST cv/candidate-cvs/:id/duplicate/', async () => {
      (httpRequest.post as jest.Mock).mockResolvedValueOnce({
        data: { id: 101, title: 'New CV (Bản sao)' },
      });

      await cvBuilderService.duplicateCandidateCV(100);
      expect(httpRequest.post).toHaveBeenCalledWith('cv/candidate-cvs/100/duplicate/');
    });
  });

  describe('setMainCandidateCV', () => {
    it('calls POST cv/candidate-cvs/:id/set-main/', async () => {
      (httpRequest.post as jest.Mock).mockResolvedValueOnce({
        data: { id: 100, is_main_cv: true },
      });

      await cvBuilderService.setMainCandidateCV(100);
      expect(httpRequest.post).toHaveBeenCalledWith('cv/candidate-cvs/100/set-main/');
    });
  });

  describe('deleteCandidateCV', () => {
    it('calls DELETE cv/candidate-cvs/:id/', async () => {
      (httpRequest.delete as jest.Mock).mockResolvedValueOnce({ data: null });

      await cvBuilderService.deleteCandidateCV(100);
      expect(httpRequest.delete).toHaveBeenCalledWith('cv/candidate-cvs/100/');
    });
  });

  describe('getPublicCV', () => {
    it('calls GET cv/public/:slug/', async () => {
      (httpRequest.get as jest.Mock).mockResolvedValueOnce({
        data: { slug: 'sample-slug', candidate_name: 'Nguyen Van A' },
      });

      await cvBuilderService.getPublicCV('sample-slug');
      expect(httpRequest.get).toHaveBeenCalledWith('cv/public/sample-slug/');
    });
  });

  describe('getSuggestions', () => {
    it('calls GET cv/suggestions/ with filters', async () => {
      (httpRequest.get as jest.Mock).mockResolvedValueOnce({
        data: { results: [{ id: 1, title: 'IT Summary' }] },
      });

      await cvBuilderService.getSuggestions({ industry: 'IT', suggestion_type: 'summary' });
      expect(httpRequest.get).toHaveBeenCalledWith('cv/suggestions/', {
        params: { industry: 'IT', suggestion_type: 'summary' },
      });
    });
  });

  describe('reviewCvWithAI', () => {
    it('calls POST cv/candidate-cvs/:id/ai-review/', async () => {
      (httpRequest.post as jest.Mock).mockResolvedValueOnce({
        data: { score: 92, grade: 'Xuất sắc', breakdown: {} },
      });

      const res = await cvBuilderService.reviewCvWithAI(100);
      expect(httpRequest.post).toHaveBeenCalledWith('cv/candidate-cvs/100/ai-review/');
      expect(res.score).toBe(92);
    });
  });
});
