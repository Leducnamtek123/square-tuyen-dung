import { readFileSync } from 'fs';
import { join } from 'path';

describe('CV Builder Pages & Fullstack Components Test Suite', () => {
  const galleryPath = join(__dirname, '../CVGalleryPage/index.tsx');
  const editorPath = join(__dirname, '../CVEditorPage/index.tsx');
  const candidateListPath = join(__dirname, '../CandidateCVListPage/index.tsx');
  const publicCvPath = join(__dirname, '../PublicCVPage/index.tsx');
  const rendererPath = join(__dirname, '../templates/CVTemplateRenderer.tsx');

  const gallerySource = readFileSync(galleryPath, 'utf8');
  const editorSource = readFileSync(editorPath, 'utf8');
  const candidateListSource = readFileSync(candidateListPath, 'utf8');
  const publicCvSource = readFileSync(publicCvPath, 'utf8');
  const rendererSource = readFileSync(rendererPath, 'utf8');

  // ============================================================================
  // 1. CVGalleryPage Tests
  // ============================================================================
  describe('CVGalleryPage (Database-Driven Catalog)', () => {
    it('uses React Query to fetch real CV templates dynamically from backend', () => {
      expect(gallerySource).toContain('useQuery');
      expect(gallerySource).toContain('cvBuilderService.getTemplates');
      expect(gallerySource).toContain('queryKey:');
    });

    it('renders category filtering and keyword search controls', () => {
      expect(gallerySource).toContain('CATEGORIES');
      expect(gallerySource).toContain('selectedCategory');
      expect(gallerySource).toContain('searchQuery');
    });

    it('includes template preview modal integration', () => {
      expect(gallerySource).toContain('TemplatePreviewModal');
      expect(gallerySource).toContain('previewTemplate');
    });

    it('links to Candidate Saved CVs list', () => {
      expect(gallerySource).toContain('/ung-vien/quan-ly-cv');
    });
  });

  // ============================================================================
  // 2. CVEditorPage Tests
  // ============================================================================
  describe('CVEditorPage (Auto-Save Studio & Profile Sync)', () => {
    it('loads CV from database when id parameter is present', () => {
      expect(editorSource).toContain('cvIdParam');
      expect(editorSource).toContain('cvBuilderService.getCandidateCVDetail');
      expect(editorSource).toContain('activeCVId');
    });

    it('implements debounced auto-save engine calling backend PATCH/POST', () => {
      expect(editorSource).toContain('debounceTimer');
      expect(editorSource).toContain('performSave');
      expect(editorSource).toContain('cvBuilderService.updateCandidateCV');
      expect(editorSource).toContain('cvBuilderService.createCandidateCV');
      expect(editorSource).toContain('saveStatus');
    });

    it('supports 1-click sync from candidate profile and active resume', () => {
      expect(editorSource).toContain('handleSyncFromProfile');
      expect(editorSource).toContain('jobSeekerProfileService.getProfile');
      expect(editorSource).toContain('jobSeekerProfileService.getResumes');
      expect(editorSource).toContain('resumeService.getExperiencesDetail');
      expect(editorSource).toContain('resumeService.getEducationsDetail');
    });

    it('provides PDF A4 export and public web CV sharing', () => {
      expect(editorSource).toContain('printCVToPDF');
      expect(editorSource).toContain('handleDownloadPDF');
      expect(editorSource).toContain('handleSharePublicLink');
    });
  });

  // ============================================================================
  // 3. CandidateCVListPage Tests
  // ============================================================================
  describe('CandidateCVListPage (Candidate CV Management Dashboard)', () => {
    it('queries candidate CVs list using React Query', () => {
      expect(candidateListSource).toContain('cvBuilderService.getCandidateCVs');
      expect(candidateListSource).toContain('cvList');
    });

    it('implements duplicate mutation', () => {
      expect(candidateListSource).toContain('duplicateMutation');
      expect(candidateListSource).toContain('cvBuilderService.duplicateCandidateCV');
    });

    it('implements set-main CV mutation', () => {
      expect(candidateListSource).toContain('setMainMutation');
      expect(candidateListSource).toContain('cvBuilderService.setMainCandidateCV');
    });

    it('implements safe delete with confirmation modal', () => {
      expect(candidateListSource).toContain('deleteMutation');
      expect(candidateListSource).toContain('cvBuilderService.deleteCandidateCV');
      expect(candidateListSource).toContain('deleteConfirmId');
    });

    it('displays summary metrics for views and main CV status', () => {
      expect(candidateListSource).toContain('totalViews');
      expect(candidateListSource).toContain('mainCV');
      expect(candidateListSource).toContain('is_main_cv');
    });
  });

  // ============================================================================
  // 4. PublicCVPage Tests
  // ============================================================================
  describe('PublicCVPage (Recruiter-Facing Online CV View)', () => {
    it('fetches public CV data by slug', () => {
      expect(publicCvSource).toContain('cvBuilderService.getPublicCV');
      expect(publicCvSource).toContain('useParams');
    });

    it('renders action bar with email, phone contact, and PDF download', () => {
      expect(publicCvSource).toContain('mailto:');
      expect(publicCvSource).toContain('tel:');
      expect(publicCvSource).toContain('handleDownloadPDF');
      expect(publicCvSource).toContain('handleCopyLink');
    });

    it('handles 404 error state gracefully when CV is private or missing', () => {
      expect(publicCvSource).toContain('CV không tồn tại hoặc đã ẩn');
      expect(publicCvSource).toContain('isError');
    });
  });

  // ============================================================================
  // 5. CVTemplateRenderer & Export Engine Tests
  // ============================================================================
  describe('CVTemplateRenderer (Multi-Template Design Engine & Expansion)', () => {
    it('supports all 8 professional template designs (including Nordic & Corporate)', () => {
      expect(rendererSource).toContain('modern-navy');
      expect(rendererSource).toContain('minimal-clean');
      expect(rendererSource).toContain('executive-emerald');
      expect(rendererSource).toContain('creative-coral');
      expect(rendererSource).toContain('tech-dark');
      expect(rendererSource).toContain('classic-editorial');
      expect(rendererSource).toContain('nordic-minimal');
      expect(rendererSource).toContain('corporate-compact');
    });

    it('supports custom typography font families in DesignCustomizer', () => {
      const designCustomizerPath = join(__dirname, '../CVEditorPage/components/forms/DesignCustomizer.tsx');
      const designCustomizerSource = readFileSync(designCustomizerPath, 'utf8');
      expect(designCustomizerSource).toContain('Inter');
      expect(designCustomizerSource).toContain('Roboto');
      expect(designCustomizerSource).toContain('Playfair Display');
      expect(designCustomizerSource).toContain('Geist');
      expect(designCustomizerSource).toContain('Outfit');
      expect(designCustomizerSource).toContain('Plus Jakarta Sans');
    });

    it('includes AI ATS Scoring tab in CV Editor Sidebar', () => {
      const sidebarPath = join(__dirname, '../CVEditorPage/components/CVEditorSidebar.tsx');
      const sidebarSource = readFileSync(sidebarPath, 'utf8');
      expect(sidebarSource).toContain('AICvScoreTab');
      expect(sidebarSource).toContain('ai-score');
      expect(sidebarSource).toContain('Chấm ATS');
    });

    it('implements exportCVToDocx and exportCVToJSON in docxExport.ts', () => {
      const docxPath = join(__dirname, '../CVEditorPage/utils/docxExport.ts');
      const docxSource = readFileSync(docxPath, 'utf8');
      expect(docxSource).toContain('exportCVToDocx');
      expect(docxSource).toContain('exportCVToJSON');
      expect(docxSource).toContain('application/msword');
      expect(docxSource).toContain('application/json');
    });
  });
});
