import { PRODUCT_TOURS, ProductTourKey } from '@/configs/productToursConfig';

describe('Product Tour System Verification', () => {
  it('should have valid configuration for all registered product tours', () => {
    const tourKeys = Object.keys(PRODUCT_TOURS) as ProductTourKey[];
    expect(tourKeys.length).toBeGreaterThanOrEqual(9);

    const expectedKeys: ProductTourKey[] = [
      'interview_ai_live',
      'practice_room',
      'candidate_dashboard',
      'cv_builder',
      'salary_benchmark',
      'employer_dashboard',
      'employer_interview_create',
      'employer_interview_detail',
      'hrm_dashboard',
    ];

    expectedKeys.forEach((key) => {
      expect(PRODUCT_TOURS[key]).toBeDefined();
      const tour = PRODUCT_TOURS[key];
      expect(tour.key).toBe(key);
      expect(tour.title).toBeTruthy();
      expect(Array.isArray(tour.steps)).toBe(true);
      expect(tour.steps.length).toBeGreaterThanOrEqual(2);

      const stepIds = new Set<string>();
      tour.steps.forEach((step) => {
        expect(step.id).toBeTruthy();
        expect(stepIds.has(step.id)).toBe(false);
        stepIds.add(step.id);

        expect(step.title).toBeTruthy();
        expect(step.content).toBeTruthy();
        expect(step.target).toMatch(/^(\[data-tour=|\.|#)/);
        if (step.placement) {
          expect(['top', 'bottom', 'left', 'right', 'auto']).toContain(step.placement);
        }
      });
    });
  });

  it('generates consistent storage keys for completion check', () => {
    const tourKey = 'interview_ai_live';
    const storageKey = `infohr_product_tour_completed_${tourKey}`;
    expect(storageKey).toBe('infohr_product_tour_completed_interview_ai_live');
  });
});
