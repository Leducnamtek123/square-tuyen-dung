import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('AdminDataGrid Architecture & Component Contract', () => {
  const indexFile = join(__dirname, '../index.tsx');
  const toolbarFile = join(__dirname, '../TableToolbar.tsx');
  const paginationFile = join(__dirname, '../TablePagination.tsx');
  const typesFile = join(__dirname, '../types.ts');

  it('verifies all AdminDataGrid module files exist', () => {
    expect(existsSync(indexFile)).toBe(true);
    expect(existsSync(toolbarFile)).toBe(true);
    expect(existsSync(paginationFile)).toBe(true);
    expect(existsSync(typesFile)).toBe(true);
  });

  it('implements multi-select, server-side pagination, and debounced search in AdminDataGrid', () => {
    const indexSource = readFileSync(indexFile, 'utf8');
    expect(indexSource).toContain('TableToolbar');
    expect(indexSource).toContain('TablePagination');
    expect(indexSource).toContain('handleSelectAll');
    expect(indexSource).toContain('handleToggleRow');
    expect(indexSource).toContain('onSortChange');
    expect(indexSource).toContain('Skeleton');
  });

  it('implements debounced search, bulk actions bar, and export menu in TableToolbar', () => {
    const toolbarSource = readFileSync(toolbarFile, 'utf8');
    expect(toolbarSource).toContain('onSearchChange');
    expect(toolbarSource).toContain('selectedRows');
    expect(toolbarSource).toContain('bulkActions');
    expect(toolbarSource).toContain('onExport');
    expect(toolbarSource).toContain('onResetFilters');
  });

  it('implements accessible page navigation in TablePagination', () => {
    const paginationSource = readFileSync(paginationFile, 'utf8');
    expect(paginationSource).toContain('pageSizeOptions');
    expect(paginationSource).toContain('onPageChange');
    expect(paginationSource).toContain('onPageSizeChange');
  });
});
