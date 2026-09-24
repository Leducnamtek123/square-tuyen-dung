export const interviewDetailCardSx = {
  p: { xs: 2.5, md: 3 },
  borderRadius: 3,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
  bgcolor: 'background.paper',
  overflow: 'hidden',
  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
} as const;

export const interviewDetailPanelSx = {
  borderRadius: 2.5,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: '#F8FAFC',
} as const;
