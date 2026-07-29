import dayjs from 'dayjs';
import { utils, writeFileXLSX, write } from 'xlsx';
import type { ExportTableRow } from '../types/api';

const xlsxUtils = {
  exportToXLSX: (data: ExportTableRow[], fileName = 'data'): void => {
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Data');
    writeFileXLSX(wb, `${fileName}_${dayjs(new Date()).format('DD-MM-YYYY')}.xlsx`);
  },

  /**
   * Generates a Blob for either XLSX or CSV file format without triggering direct download.
   */
  generateBlob: (data: Record<string, any>[], format: 'xlsx' | 'csv' = 'xlsx'): Blob => {
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'ExportData');

    if (format === 'csv') {
      const csvStr = utils.sheet_to_csv(ws);
      // UTF-8 BOM for proper Vietnamese unicode display in Excel
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
      return new Blob([bom, csvStr], { type: 'text/csv;charset=utf-8;' });
    }

    const arrayBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([arrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  },

  /**
   * Triggers a browser file download from a given Blob and filename.
   */
  triggerDownload: (blob: Blob, fileName: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};

export default xlsxUtils;
