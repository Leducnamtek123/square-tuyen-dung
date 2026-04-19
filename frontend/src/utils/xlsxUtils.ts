import dayjs from 'dayjs';
import { utils, writeFileXLSX } from 'xlsx';
import type { ExportTableRow } from '../types/api';

const xlsxUtils = {
  exportToXLSX: (data: ExportTableRow[], fileName = 'data'): void => {
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Data');
    writeFileXLSX(wb, `${fileName}_${dayjs(new Date()).format('DD-MM-YYYY')}.xlsx`);
  },
};

export default xlsxUtils;
