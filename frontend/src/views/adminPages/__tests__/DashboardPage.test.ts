import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Admin Dashboard Architecture & Live Analytics Contract', () => {
  const indexFile = join(__dirname, '../DashboardPage/index.tsx');
  const metricCardFile = join(__dirname, '../DashboardPage/components/LiveMetricCard.tsx');
  const chartFile = join(__dirname, '../DashboardPage/components/AnalyticsCharts.tsx');
  const widgetFile = join(__dirname, '../DashboardPage/components/PendingActionWidget.tsx');

  it('verifies all DashboardPage components exist', () => {
    expect(existsSync(indexFile)).toBe(true);
    expect(existsSync(metricCardFile)).toBe(true);
    expect(existsSync(chartFile)).toBe(true);
    expect(existsSync(widgetFile)).toBe(true);
  });

  it('implements live metric cards with deltas and hooks in DashboardPage', () => {
    const source = readFileSync(indexFile, 'utf8');
    expect(source).toContain('useAdminStats');
    expect(source).toContain('LiveMetricCard');
    expect(source).toContain('AnalyticsCharts');
    expect(source).toContain('PendingActionWidget');
  });

  it('provides multi-period filter and multi-dataset chart in AnalyticsCharts', () => {
    const source = readFileSync(chartFile, 'utf8');
    expect(source).toContain('useAdminTrendStats');
    expect(source).toContain('BarChartClient');
    expect(source).toContain('ToggleButtonGroup');
  });

  it('links pending items directly to moderation and verification routes in PendingActionWidget', () => {
    const source = readFileSync(widgetFile, 'utf8');
    expect(source).toContain('ROUTES.ADMIN.JOBS');
    expect(source).toContain('ROUTES.ADMIN.COMPANY_VERIFICATIONS');
    expect(source).toContain('ROUTES.ADMIN.TRUST_REPORTS');
  });
});
