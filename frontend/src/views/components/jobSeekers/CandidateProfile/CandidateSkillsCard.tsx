'use client';

import React from 'react';
import {
  Card,
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface CandidateSkillsCardProps {
  initialSkills?: string[];
}

const CandidateSkillsCard: React.FC<CandidateSkillsCardProps> = ({
  initialSkills = [],
}) => {
  const [skills, setSkills] = React.useState<string[]>(initialSkills || []);

  React.useEffect(() => {
    if (initialSkills && initialSkills.length > 0) {
      setSkills(initialSkills);
    }
  }, [initialSkills]);
  const [openModal, setOpenModal] = React.useState(false);
  const [newSkillInput, setNewSkillInput] = React.useState('');

  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    if (!skills.includes(newSkillInput.trim())) {
      setSkills((prev) => [...prev, newSkillInput.trim()]);
    }
    setNewSkillInput('');
  };

  const handleDeleteSkill = (skillToDelete: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToDelete));
  };

  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Kỹ năng chuyên môn
          </Typography>
          <Chip
            label={`${skills.length} kỹ năng`}
            size="small"
            sx={{ backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: 700, fontSize: '0.725rem', height: 22 }}
          />
        </Box>
        <IconButton aria-label="Thao tác" size="small" onClick={() => setOpenModal(true)} sx={{ color: '#64748b' }}>
          <EditOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {skills.length === 0 ? (
        <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.875rem' }}>
          Chưa thêm kỹ năng chuyên môn nào.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {skills.map((skill) => (
            <Chip
              key={skill}
              label={skill}
              icon={<CheckCircleOutlineIcon sx={{ fontSize: 15, color: '#2563eb !important' }} />}
              sx={{
                borderRadius: '10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontWeight: 600,
                color: '#0f172a',
                fontSize: '0.8rem',
                py: 0.5,
                '&:hover': {
                  backgroundColor: '#eff6ff',
                  borderColor: '#bfdbfe',
                },
              }}
            />
          ))}
          <Button
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            onClick={() => setOpenModal(true)}
            sx={{
              borderRadius: '10px',
              border: '1px solid #BFDBFE',
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              fontWeight: 700,
              fontSize: '0.775rem',
              textTransform: 'none',
              px: 1.5,
              py: 0.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#93C5FD',
                backgroundColor: '#DBEAFE',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Thêm kỹ năng
          </Button>
        </Box>
      )}

      {/* Edit Skills Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>Quản lý kỹ năng chuyên môn</DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#f1f5f9' }}>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Nhập tên kỹ năng..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />
              <Button
                variant="contained"
                onClick={handleAddSkill}
                sx={{ borderRadius: '10px', backgroundColor: '#2563eb', fontWeight: 700, px: 2 }}
              >
                Thêm
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 1 }}>
              {skills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  onDelete={() => handleDeleteSkill(skill)}
                  sx={{ borderRadius: '10px', fontWeight: 600 }}
                />
              ))}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="contained"
            onClick={() => setOpenModal(false)}
            sx={{ borderRadius: '10px', backgroundColor: '#2563eb', fontWeight: 700, width: '100%' }}
          >
            Hoàn tất
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default CandidateSkillsCard;
