import React from 'react';
import { Typography, Box, Chip, alpha, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const SkillChipList: React.FC<{
  skills: string[] | string | null | undefined;
  color: 'success' | 'error' | 'default' | 'primary';
  icon?: React.ReactElement | null;
}> = ({ skills, color, icon }) => {
  const { t } = useTranslation('employer');
  const theme = useTheme();

  if (!skills) return <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', opacity: 0.7 }}>{t('appliedResume.ai.noData')}</Typography>;

  const skillArray = Array.isArray(skills)
    ? skills
    : typeof skills === 'string'
      ? skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];

  if (skillArray.length === 0) return <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', opacity: 0.7 }}>{t('appliedResume.ai.noData')}</Typography>;

  const getChipColor = () => {
    switch(color) {
      case 'success': return theme.palette.success.main;
      case 'error': return theme.palette.error.main;
      case 'primary': return theme.palette.primary.main;
      default: return theme.palette.text.primary;
    }
  };

  const mainColor = getChipColor();

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {skillArray.map((skill, idx) => (
        <Chip
          key={idx}
          label={skill}
          size="small"
          variant="filled"
          icon={icon || undefined}
          sx={{ 
            fontSize: '0.75rem', 
            fontWeight: 800,
            borderRadius: 1.5,
            bgcolor: alpha(mainColor, 0.08),
            color: mainColor,
            border: 'none',
            '& .MuiChip-icon': { color: 'inherit', fontSize: '14px' }
          }}
        />
      ))}
    </Box>
  );
};
