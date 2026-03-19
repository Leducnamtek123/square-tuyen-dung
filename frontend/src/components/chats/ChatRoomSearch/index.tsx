import React from 'react';
import { TextField } from "@mui/material";

interface ChatRoomSearchProps {
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
}

const ChatRoomSearch = ({ value, setValue, placeholder }: ChatRoomSearchProps) => {
  return (
    <TextField
      fullWidth
      id="filled-search"
      type="search"
      variant="outlined"
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

export default ChatRoomSearch;
