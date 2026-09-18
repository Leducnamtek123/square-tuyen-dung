import {
  getRadarPoint,
  generatePolygonPath,
  RadarDimension,
} from '../CompetencyRadarChart';

describe('CompetencyRadarChart Mathematical Engine', () => {
  const cx = 160;
  const cy = 160;
  const radius = 100;
  const totalAxes = 4;

  describe('getRadarPoint', () => {
    it('calculates top vertex (index 0, angle -90 deg) at ratio 1.0', () => {
      const pt = getRadarPoint(0, totalAxes, 1.0, cx, cy, radius);
      expect(pt.x).toBeCloseTo(160, 1);
      expect(pt.y).toBeCloseTo(60, 1); // 160 - 100 = 60
    });

    it('calculates right vertex (index 1, angle 0 deg) at ratio 1.0', () => {
      const pt = getRadarPoint(1, totalAxes, 1.0, cx, cy, radius);
      expect(pt.x).toBeCloseTo(260, 1); // 160 + 100 = 260
      expect(pt.y).toBeCloseTo(160, 1);
    });

    it('calculates bottom vertex (index 2, angle 90 deg) at ratio 1.0', () => {
      const pt = getRadarPoint(2, totalAxes, 1.0, cx, cy, radius);
      expect(pt.x).toBeCloseTo(160, 1);
      expect(pt.y).toBeCloseTo(260, 1); // 160 + 100 = 260
    });

    it('calculates left vertex (index 3, angle 180 deg) at ratio 1.0', () => {
      const pt = getRadarPoint(3, totalAxes, 1.0, cx, cy, radius);
      expect(pt.x).toBeCloseTo(60, 1); // 160 - 100 = 60
      expect(pt.y).toBeCloseTo(160, 1);
    });

    it('clamps ratio below 0 to center', () => {
      const pt = getRadarPoint(0, totalAxes, -0.5, cx, cy, radius);
      expect(pt.x).toBe(160);
      expect(pt.y).toBe(160);
    });

    it('clamps ratio above 1 to maximum radius', () => {
      const pt = getRadarPoint(0, totalAxes, 1.5, cx, cy, radius);
      expect(pt.x).toBe(160);
      expect(pt.y).toBe(60);
    });

    it('calculates mid-point correctly for 50%', () => {
      const pt = getRadarPoint(0, totalAxes, 0.5, cx, cy, radius);
      expect(pt.x).toBe(160);
      expect(pt.y).toBe(110); // 160 - 50 = 110
    });
  });

  describe('generatePolygonPath', () => {
    it('returns empty string for empty values', () => {
      expect(generatePolygonPath([], cx, cy, radius)).toBe('');
    });

    it('generates closed path string for 4 dimensions', () => {
      const values = [100, 75, 50, 25];
      const path = generatePolygonPath(values, cx, cy, radius);
      expect(path.startsWith('M ')).toBe(true);
      expect(path.endsWith(' Z')).toBe(true);
      expect(path).toContain(' L ');
      // 4 points means 3 ' L ' separators
      const segments = path.split(' L ');
      expect(segments.length).toBe(4);
    });
  });
});
