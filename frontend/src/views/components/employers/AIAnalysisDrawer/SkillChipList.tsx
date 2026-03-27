import React from 'react';
import { Typography, Box, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const SkillChipList: React.FC<{
  skills: string[] | string | null | undefined;
  color: 'success' | 'error' | 'default' | 'primary';
  icon?: React.ReactElement | null;
}> = ({ skills, color, icon }) => {
  const { t } = useTranslation('employer');
  if (!skills) return <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>{t('appliedResume.ai.noData')}</Typography>;

  const skillArray = Array.isArray(skills)
    ? skills
    : typeof skills === 'string'
      ? skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];

  if (skillArray.length === 0) return <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>{t('appliedResume.ai.noData')}</Typography>;


  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
      {skillArray.map((skill, idx) => (
        <Chip
          key={idx}
          label={skill}
          size="small"
          color={color}
          variant="outlined"
          icon={icon || undefined}
          sx={{ fontSize: '0.75rem', fontWeight: 500 }}
        />
      ))}
    </Box>
  );
};
