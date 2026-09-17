import React from 'react';
import { TextField, InputAdornment } from "@mui/material";
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

interface ChatRoomSearchProps {
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
}

const ChatRoomSearch = ({ value, setValue, placeholder }: ChatRoomSearchProps) => {
  return (
    <TextField
      fullWidth
      id="chat-room-search"
      type="search"
      variant="outlined"
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          backgroundColor: '#f8fafc',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '& fieldset': {
            borderColor: '#e2e8f0',
          },
          '&:hover fieldset': {
            borderColor: '#cbd5e1',
          },
          '&.Mui-focused': {
            backgroundColor: '#ffffff',
            boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#2563eb',
          },
        },
      }}
    />
  );
};

export default ChatRoomSearch;

