import fs from 'node:fs';
import path from 'node:path';
import type { Page } from '@playwright/test';
import type {
  AuditSummary,
  LifecycleState,
  SeverityLevel,
  StateCheckResult,
  StateMatrixRecord,
  UXIssue,
} from './types';

class LoadingMatrixReporter {
  private static instance: LoadingMatrixReporter;
  private recordsMap: Map<string, StateMatrixRecord> = new Map();
  private allIssues: UXIssue[] = [];
  private baseOutputDir: string = path.resolve(process.cwd(), 'test-results', 'loading-matrix');

  private constructor() {
    this.ensureDirectory(this.baseOutputDir);
  }

  public static getInstance(): LoadingMatrixReporter {
    if (!LoadingMatrixReporter.instance) {
      LoadingMatrixReporter.instance = new LoadingMatrixReporter();
    }
    return LoadingMatrixReporter.instance;
  }

  private ensureDirectory(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Sanitizes route path to create safe folder names
   */
  public sanitizeRouteSlug(route: string): string {
    return route
      .replace(/^\/+/, '')
      .replace(/[\/?&=:]/g, '_')
      .replace(/_+/g, '_') || 'root';
  }

  /**
   * Captures a screenshot representing a specific state of a route
   */
  public async captureStateScreenshot(
    page: Page,
    route: string,
    state: LifecycleState | string
  ): Promise<string> {
    const slug = this.sanitizeRouteSlug(route);
    const routeDir = path.join(this.baseOutputDir, slug);
    this.ensureDirectory(routeDir);

    const filename = `${slug}.${state}.png`;
    const fullPath = path.join(routeDir, filename);

    try {
      await page.screenshot({ path: fullPath, fullPage: false });
    } catch {
      // In case taking screenshot fails due to navigation, do not break test
    }

    return path.relative(process.cwd(), fullPath).replace(/\\/g, '/');
  }

  /**
   * Records a state check in the matrix
   */
  public recordState(
    route: string,
    state: LifecycleState | string,
    status: 'PASS' | 'FAIL' | 'WARN',
    details?: string,
    screenshot?: string
  ) {
    if (!this.recordsMap.has(route)) {
      this.recordsMap.set(route, {
        route,
        testedStates: [],
        issues: [],
      });
    }

    const record = this.recordsMap.get(route)!;
    const existingIndex = record.testedStates.findIndex((s) => s.state === state);
    const item: StateCheckResult = { state, status, details, screenshot };

    if (existingIndex >= 0) {
      record.testedStates[existingIndex] = item;
    } else {
      record.testedStates.push(item);
    }
  }

  /**
   * Records a UX issue categorized by severity (P0 - P3)
   */
  public recordIssue(issue: UXIssue) {
    this.allIssues.push(issue);

    if (!this.recordsMap.has(issue.route)) {
      this.recordsMap.set(issue.route, {
        route: issue.route,
        testedStates: [],
        issues: [],
      });
    }

    this.recordsMap.get(issue.route)!.issues.push(issue);
  }

  /**
   * Generates summary statistics and writes JSON & Markdown reports to disk
   */
  public exportReports(): AuditSummary {
    const records = Array.from(this.recordsMap.values());
    let totalChecks = 0;
    records.forEach((r) => {
      totalChecks += r.testedStates.length;
    });

    const p0Count = this.allIssues.filter((i) => i.severity === 'P0').length;
    const p1Count = this.allIssues.filter((i) => i.severity === 'P1').length;
    const p2Count = this.allIssues.filter((i) => i.severity === 'P2').length;
    const p3Count = this.allIssues.filter((i) => i.severity === 'P3').length;

    const summary: AuditSummary = {
      timestamp: new Date().toISOString(),
      totalRoutesTested: records.length,
      totalChecks,
      totalIssues: this.allIssues.length,
      p0Count,
      p1Count,
      p2Count,
      p3Count,
      records,
    };

    this.ensureDirectory(this.baseOutputDir);

    // 1. Write JSON
    const jsonPath = path.join(this.baseOutputDir, 'loading-matrix-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2), 'utf8');

    // 2. Write Markdown
    const mdPath = path.join(this.baseOutputDir, 'LOADING_UX_AUDIT_REPORT.md');
    fs.writeFileSync(mdPath, this.generateMarkdownReport(summary), 'utf8');

    return summary;
  }

  private generateMarkdownReport(summary: AuditSummary): string {
    const lines: string[] = [];

    lines.push('# 📊 Báo Cáo Kiểm Thử Tự Động: Loading & UX State Matrix');
    lines.push(`> Thời gian thực hiện: **${summary.timestamp}** | Tổng số Route kiểm thử: **${summary.totalRoutesTested}** | Số lượt kiểm tra trạng thái: **${summary.totalChecks}**`);
    lines.push('');

    // Summary badge cards
    lines.push('## 1. Tóm Tắt Mức Độ Nghiêm Trọng');
    lines.push('| Mức độ | Số lượng lỗi | Định nghĩa & Mức độ ảnh hưởng | Trạng thái xử lý |');
    lines.push('| :--- | :---: | :--- | :--- |');
    lines.push(`| 🔴 **P0 — Blocking** | **${summary.p0Count}** | Trắng màn hình, Crash, Double submit, Treo vô tận | **Cần sửa ngay lập tức** |`);
    lines.push(`| 🟠 **P1 — UX Nghiêm Trọng** | **${summary.p1Count}** | Fullpage mask che filter, Mất data cũ khi paginate, Nút submit không disabled, Không có ảnh fallback | **Ưu tiên trong sprint** |`);
    lines.push(`| 🟡 **P2 — UX Trải Nghiệm** | **${summary.p2Count}** | Lạm dụng spinner, Tìm kiếm không debounce, Skeleton lệch nhẹ, Chuyển cảnh giật | **Đưa vào UX Backlog** |`);
    lines.push(`| 🔵 **P3 — Polish** | **${summary.p3Count}** | Hiệu ứng animation, Skeleton shape, ARIA/Accessibility | **Hoàn thiện thẩm mỹ** |`);
    lines.push('');

    // Detailed Issues List
    lines.push('## 2. Danh Sách Vấn Đề Ghi Nhận (Chi tiết theo P0 - P3)');
    if (this.allIssues.length === 0) {
      lines.push('🎉 **Chúc mừng! Không phát hiện vấn đề nào vi phạm tiêu chuẩn Loading & UX State Matrix.**');
    } else {
      lines.push('| Route | Trạng thái | Mức độ | Vấn đề phát hiện | Kỳ vọng chuẩn UX | Ảnh minh chứng |');
      lines.push('| :--- | :--- | :---: | :--- | :--- | :---: |');
      for (const issue of this.allIssues) {
        const screenshotLink = issue.screenshot ? `[Xem ảnh](${issue.screenshot})` : '—';
        lines.push(
          `| \`${issue.route}\` | \`${issue.state}\` | **${issue.severity}** | ${issue.issue} | ${issue.expected} | ${screenshotLink} |`
        );
      }
    }
    lines.push('');

    // State Matrix Per Route
    lines.push('## 3. Ma Trận Trạng Thái Chi Tiết Theo Tuyến Tuyến (State Matrix Per Route)');
    for (const record of summary.records) {
      lines.push(`### 🌐 Route: \`${record.route}\``);
      lines.push('| State | Kết quả | Chi tiết kiểm tra | Ảnh chụp Visual Regression |');
      lines.push('| :--- | :---: | :--- | :---: |');
      for (const st of record.testedStates) {
        const statusBadge = st.status === 'PASS' ? '✅ PASS' : st.status === 'FAIL' ? '❌ FAIL' : '⚠️ WARN';
        const imgLink = st.screenshot ? `[Ảnh chụp](${st.screenshot})` : '—';
        lines.push(`| \`${st.state}\` | ${statusBadge} | ${st.details || 'Bình thường'} | ${imgLink} |`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}

export const matrixReporter = LoadingMatrixReporter.getInstance();
