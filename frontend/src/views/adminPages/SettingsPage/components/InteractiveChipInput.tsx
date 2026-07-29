'use client';

import React, { useState } from 'react';
import { Box, Chip, TextField, Button, Stack, Typography, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

interface InteractiveChipInputProps {
  label: string;
  helperText?: string;
  chips: string[];
  onChange: (newChips: string[]) => void;
  placeholder?: string;
}

export const InteractiveChipInput: React.FC<InteractiveChipInputProps> = ({
  label,
  helperText,
  chips,
  onChange,
  placeholder = 'Nhập câu hỏi gợi ý mới và nhấn Enter...',
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddChip = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (chips.includes(trimmed)) {
      setInputValue('');
      return;
    }
    onChange([...chips, trimmed]);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddChip();
    }
  };

  const handleDeleteChip = (indexToDelete: number) => {
    onChange(chips.filter((_, index) => index !== indexToDelete));
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <LocalOfferIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {label}
        </Typography>
      </Stack>

      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          {helperText}
        </Typography>
      )}

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: '12px',
          borderColor: 'divider',
          background: '#fafafa',
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: chips.length > 0 ? 2 : 0 }}>
          {chips.map((chipText, chipIdx) => (
            <Chip
              key={`chip-item-${chipText}`}
              label={chipText}
              onDelete={() => handleDeleteChip(chipIdx)}
              sx={{
                background: '#fff0f3',
                color: '#e11d48',
                borderColor: '#fecdd3',
                borderWidth: 1,
                borderStyle: 'solid',
                fontWeight: 600,
                fontSize: '0.85rem',
                borderRadius: '999px',
                py: 2,
                '& .MuiChip-deleteIcon': {
                  color: '#fb7185',
                  '&:hover': {
                    color: '#be123c',
                  },
                },
                '&:hover': {
                  background: '#ffe4e6',
                },
              }}
            />
          ))}

          {chips.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 0.5 }}>
              Chưa có câu hỏi gợi ý nào. Hãy thêm gợi ý đầu tiên bên dưới.
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <TextField
            size="small"
            fullWidth
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{
              background: '#ffffff',
              borderRadius: '8px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddChip}
            disabled={!inputValue.trim()}
            sx={{
              borderRadius: '8px',
              px: 2.5,
              whiteSpace: 'nowrap',
              fontWeight: 600,
            }}
          >
            Thêm
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default InteractiveChipInput;
