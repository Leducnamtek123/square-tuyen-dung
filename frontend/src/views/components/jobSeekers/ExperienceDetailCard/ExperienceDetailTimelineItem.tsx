import React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, Stack, Typography } from '@mui/material';
import {
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import { Theme } from '@mui/material/styles';
import TimeAgo from '../../../../components/Common/TimeAgo';
import type { ExperienceDetail } from '../../../../types/models';

type Props = {
  value: ExperienceDetail;
  onEdit: (id: string | number) => void;
  onDelete: (id: string | number) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
};

const ExperienceDetailTimelineItem = ({ value, onEdit, onDelete, t }: Props) => (
  <TimelineItem key={value.id}>
    <TimelineSeparator>
      <TimelineDot
        sx={{
          background: (theme: Theme) => theme.palette.primary.main,
          boxShadow: (theme: Theme) => theme.customShadows.small,
        }}
      />
      <TimelineConnector sx={{ bgcolor: 'primary.light' }} />
    </TimelineSeparator>
    <TimelineContent>
      <Box sx={{ p: 1 }}>
        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600, mb: 1 }}>
          {value.startDate && <TimeAgo date={value.startDate} type="format" format="DD/MM/YYYY" />}{' '}
          -{' '}
          {value.endDate ? (
            <TimeAgo date={value.endDate} type="format" format="DD/MM/YYYY" />
          ) : (
            t('jobSeeker:profile.fields.present')
          )}
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          {value.jobName}
        </Typography>

        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
          {value.companyName}
        </Typography>

        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            sx={{
              color: 'secondary.main',
              bgcolor: 'secondary.background',
              '&:hover': {
                bgcolor: 'secondary.light',
                color: 'white',
              },
            }}
            onClick={() => onEdit(value.id)}
          >
            <ModeEditOutlineOutlinedIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            sx={{
              color: 'error.main',
              bgcolor: 'error.background',
              '&:hover': {
                bgcolor: 'error.main',
                color: 'white',
              },
            }}
            onClick={() => onDelete(value.id)}
          >
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Accordion
          sx={{
            boxShadow: 'none',
            bgcolor: 'transparent',
            '&:before': {
              display: 'none',
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main', fontSize: 20 }} />}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {t('jobSeeker:profile.fields.description')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              sx={{
                color: value.description ? 'text.primary' : 'text.placeholder',
                fontStyle: value.description ? 'normal' : 'italic',
              }}
            >
              {value.description || t('common:noData')}
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    </TimelineContent>
  </TimelineItem>
);

export default ExperienceDetailTimelineItem;
