'use client';

import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  IconButton,
  alpha,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import TerminalIcon from '@mui/icons-material/Terminal';

export interface TechnicalDetailsProps {
  data: Record<string, string | number | null | undefined | boolean>;
  title?: string;
  defaultExpanded?: boolean;
}

export default function TechnicalDetails({
  data,
  title = 'Thông tin kỹ thuật (Dành cho Quản trị viên)',
  defaultExpanded = false,
}: TechnicalDetailsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, value: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const entries = Object.entries(data).filter(
    ([, val]) => val !== undefined && val !== null && val !== ''
  );

  if (entries.length === 0) return null;

  return (
    <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed #E2E8F0' }}>
      <Accordion
        defaultExpanded={defaultExpanded}
        elevation={0}
        disableGutters
        sx={{
          bgcolor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '10px !important',
          '&:before': { display: 'none' },
          overflow: 'hidden',
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ fontSize: 18, color: '#64748B' }} />}
          sx={{
            minHeight: 42,
            px: 2,
            py: 0.5,
            '& .MuiAccordionSummary-content': { my: 0.5, alignItems: 'center', gap: 1 },
          }}
        >
          <TerminalIcon sx={{ fontSize: 16, color: '#64748B' }} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', letterSpacing: 0.2 }}>
            {title}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 2, py: 1.5, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
          <Table size="small" sx={{ '& td': { py: 0.75, borderBottom: '1px solid #F1F5F9' } }}>
            <TableBody>
              {entries.map(([key, val]) => {
                const strVal = String(val);
                const isCopied = copiedKey === key;
                return (
                  <TableRow key={key}>
                    <TableCell
                      sx={{
                        width: '35%',
                        color: '#64748B',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        pl: 0,
                      }}
                    >
                      {key}
                    </TableCell>
                    <TableCell sx={{ pr: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'monospace',
                            color: '#0F172A',
                            fontWeight: 700,
                            wordBreak: 'break-all',
                            fontSize: '0.75rem',
                          }}
                        >
                          {strVal}
                        </Typography>
                        <Tooltip title={isCopied ? 'Đã sao chép!' : 'Sao chép'} arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(key, strVal)}
                            sx={{
                              p: 0.5,
                              color: isCopied ? '#10B981' : '#94A3B8',
                              '&:hover': { bgcolor: alpha('#94A3B8', 0.1) },
                            }}
                          >
                            {isCopied ? <CheckIcon sx={{ fontSize: 13 }} /> : <ContentCopyIcon sx={{ fontSize: 13 }} />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
