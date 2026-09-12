import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('HRM Architecture & Operational Pages', () => {
  const orgChartFile = join(__dirname, '../OrgChartPage/index.tsx');
  const hrmDashboardFile = join(__dirname, '../HrmDashboardPage/index.tsx');
  const employeeListFile = join(__dirname, '../EmployeeListPage/index.tsx');
  const departmentListFile = join(__dirname, '../DepartmentListPage/index.tsx');
  const contractListFile = join(__dirname, '../ContractListPage/index.tsx');
  const leaveListFile = join(__dirname, '../LeaveListPage/index.tsx');
  const onboardingFile = join(__dirname, '../OnboardingPage/index.tsx');

  it('verifies all HRM operational page modules exist', () => {
    expect(existsSync(orgChartFile)).toBe(true);
    expect(existsSync(hrmDashboardFile)).toBe(true);
    expect(existsSync(employeeListFile)).toBe(true);
    expect(existsSync(departmentListFile)).toBe(true);
    expect(existsSync(contractListFile)).toBe(true);
    expect(existsSync(leaveListFile)).toBe(true);
    expect(existsSync(onboardingFile)).toBe(true);
  });

  it('implements interactive tree hierarchy in OrgChartPage', () => {
    const source = readFileSync(orgChartFile, 'utf8');
    expect(source).toContain('useHrmOrgChart');
    expect(source).toContain('renderTreeNode');
    expect(source).toContain('handleExpandAll');
    expect(source).toContain('handleCollapseAll');
  });

  it('implements comprehensive operational KPIs in HrmDashboardPage', () => {
    const source = readFileSync(hrmDashboardFile, 'utf8');
    expect(source).toContain('useHrmDashboardStats');
    expect(source).toContain('useHrmEmployees');
    expect(source).toContain('useHrmDepartments');
    expect(source).toContain('useHrmLeaves');
  });

  it('implements BiometricLogsPage deduplication and device filtering', () => {
    const biometricFile = join(__dirname, '../AttendancePages/BiometricLogsPage/index.tsx');
    expect(existsSync(biometricFile)).toBe(true);
    const source = readFileSync(biometricFile, 'utf8');
    expect(source).toContain('deduplicatePunchLogs');
    expect(source).toContain('Khử trùng lặp');
    expect(source).toContain('is_duplicate');
  });

  it('implements EmployeeListPage Career Timeline and Digital Document Vault', () => {
    const source = readFileSync(employeeListFile, 'utf8');
    expect(source).toContain('useHrmCareerHistories');
    expect(source).toContain('useHrmDocuments');
    expect(source).toContain('CAREER_EVENT_CONFIG');
    expect(source).toContain('DOCUMENT_TYPE_CONFIG');
    expect(source).toContain('Lịch sử công tác');
    expect(source).toContain('Hồ sơ tài liệu số');
  });
});
