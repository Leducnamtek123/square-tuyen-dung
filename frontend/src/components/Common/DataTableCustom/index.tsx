import * as React from 'react';

import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

import Table from '@mui/material/Table';

import TableCell from '@mui/material/TableCell';

import TableContainer from '@mui/material/TableContainer';

import TableHead from '@mui/material/TableHead';

import TablePagination from '@mui/material/TablePagination';

import TableRow from '@mui/material/TableRow';

import TableSortLabel from '@mui/material/TableSortLabel';

import { visuallyHidden } from '@mui/utils';

import { Skeleton, Stack } from "@mui/material";

interface HeadCell {
  id: string;
  label: string;
  numeric?: boolean;
  disablePadding?: boolean;
  showOrder?: boolean;
}

interface EnhancedTableHeadProps {
  headCells: HeadCell[];
  order: 'asc' | 'desc';
  orderBy: string;
  onRequestSort?: (event: React.MouseEvent<unknown>, property: string) => void;
}



function EnhancedTableHead({ headCells = [], order, orderBy, onRequestSort }: EnhancedTableHeadProps) {

  const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {

    if (!onRequestSort) return;

    onRequestSort(event, property);

  };

  return (

    <TableHead>

      <TableRow>

        {headCells.map((headCell: HeadCell) => (

          <TableCell

            key={headCell.id}

            align={headCell.numeric ? 'right' : 'left'}

            padding={headCell.disablePadding ? 'none' : 'normal'}

            sortDirection={orderBy === headCell.id ? order : false}

          >

            {(() => {

              const sortable = Boolean(onRequestSort) && Boolean(headCell.showOrder);

              return (

            <TableSortLabel

              disabled={!sortable}

              active={sortable && orderBy === headCell.id}

              direction={orderBy === headCell.id ? order : 'asc'}

              onClick={createSortHandler(headCell.id)}

            >

              {headCell.label}

              {orderBy === headCell.id ? (

                <Box component="span" sx={visuallyHidden}>

                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}

                </Box>

              ) : null}

            </TableSortLabel>

              );

            })()}

          </TableCell>

        ))}

      </TableRow>

    </TableHead>

  );

}

EnhancedTableHead.propTypes = {

  onRequestSort: PropTypes.func,

  order: PropTypes.oneOf(['asc', 'desc']),

  orderBy: PropTypes.string,

};

interface DataTableCustomProps {
  headCells?: HeadCell[];
  rows?: Record<string, unknown>[];
  order?: 'asc' | 'desc';
  orderBy?: string;
  page?: number;
  rowsPerPage?: number;
  count?: number;
  handleRequestSort?: (event: React.MouseEvent<unknown>, property: string) => void;
  handleChangePage?: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  handleChangeRowsPerPage?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDelete?: (id: string | number) => void;
  handleUpdate?: (id: string | number) => void;
  children?: React.ReactNode;
}

const DataTableCustom = ({
  headCells = [],
  rows = [],
  order,
  orderBy,
  page = 0,
  rowsPerPage = 10,
  count = 0,
  handleRequestSort,
  handleChangePage,
  handleChangeRowsPerPage,
  handleDelete,
  handleUpdate,
  children,
}: DataTableCustomProps) => {

  const resolvedOrder = order ?? 'asc';

  const resolvedOrderBy = orderBy ?? (headCells?.[0]?.id || '');

  const resolvedRequestSort = handleRequestSort || undefined;

  return (

    <Box sx={{ width: '100%' }}>

      <TableContainer>

        <Table

          sx={{ minWidth: 750 }}

          aria-labelledby="tableTitle"

          size="medium"

        >

          <EnhancedTableHead

            headCells={headCells}

            order={resolvedOrder}

            orderBy={resolvedOrderBy}

            onRequestSort={resolvedRequestSort}

          />

          {children}

        </Table>

      </TableContainer>

      <TablePagination

        rowsPerPageOptions={[5, 10, 25]}

        component="div"

        count={count}

        rowsPerPage={rowsPerPage}

        page={page}

        onPageChange={handleChangePage || (() => { })}

        onRowsPerPageChange={handleChangeRowsPerPage}

      />

    </Box>

  );

};

const Loading = () => {

  return (

    <Stack>

      {Array(12)
        .fill(null)
        .map((_, index) => (

          <Skeleton key={index} height={50} />

        ))}

    </Stack>

  );

};

DataTableCustom.Loading = Loading;

export default React.memo(DataTableCustom);
