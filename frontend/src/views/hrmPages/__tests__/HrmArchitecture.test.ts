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
});
