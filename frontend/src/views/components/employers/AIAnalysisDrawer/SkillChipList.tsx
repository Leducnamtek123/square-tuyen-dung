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

  const getChipColor = () => {
    switch(color) {
      case 'success': return theme.palette.success.main;
      case 'error': return theme.palette.error.main;
      case 'primary': return theme.palette.primary.main;
      default: return theme.palette.text.primary;
    }
  };

  const mainColor = getChipColor();
  const EMPTY_SKILLS: string[] = [];
  const normalizedSkills = Array.isArray(skills)
    ? skills.flatMap((skill) => {
        const text = String(skill || '').trim();
        return text ? [text] : [];
      })
    : typeof skills === 'string'
      ? skills.split(',').flatMap((skill) => {
          const text = skill.trim();
          return text ? [text] : [];
      })
      : EMPTY_SKILLS;

  if (normalizedSkills.length === 0) return <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', opacity: 0.7 }}>{t('appliedResume.ai.noData')}</Typography>;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {normalizedSkills.map((skill) => (
        <Chip
          key={skill}
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
