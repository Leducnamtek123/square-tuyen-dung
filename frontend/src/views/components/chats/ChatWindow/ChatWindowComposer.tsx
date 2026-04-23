import React from 'react';
import {
  CircularProgress,
  IconButton,
  InputBase,
  Paper,
  Popover,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EmojiPicker from 'emoji-picker-react';

type ChatWindowComposerProps = {
  inputRef: React.RefObject<HTMLInputElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  inputValue: string;
  isUploading: boolean;
  uploadProgress: number;
  emojiAnchorEl: HTMLButtonElement | null;
  onSubmit: (event: React.FormEvent) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onOpenFilePicker: () => void;
  onEmojiClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onEmojiClose: () => void;
  onEmojiSelect: (emojiObject: any) => void;
  onInputChange: (value: string) => void;
  placeholderText: string;
};

export const ChatWindowComposer = ({
  inputRef,
  fileInputRef,
  inputValue,
  isUploading,
  uploadProgress,
  emojiAnchorEl,
  onSubmit,
  onFileUpload,
  onOpenFilePicker,
  onEmojiClick,
  onEmojiClose,
  onEmojiSelect,
  onInputChange,
  placeholderText,
}: ChatWindowComposerProps) => (
  <Paper
    component="form"
    onSubmit={onSubmit}
    elevation={0}
    sx={{
      p: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      borderTop: 1,
      borderColor: 'divider',
      bgcolor: 'background.paper',
    }}
  >
    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={onFileUpload} />
    <IconButton size="small" sx={{ mr: 1 }} disabled={isUploading} onClick={onOpenFilePicker}>
      {isUploading ? (
        <CircularProgress size={20} variant="determinate" value={uploadProgress} />
      ) : (
        <AttachFileIcon fontSize="small" />
      )}
    </IconButton>
    <IconButton size="small" sx={{ mr: 1 }} onClick={onEmojiClick}>
      <SentimentSatisfiedAltIcon fontSize="small" />
    </IconButton>

    <Popover
      open={Boolean(emojiAnchorEl)}
      anchorEl={emojiAnchorEl}
      onClose={onEmojiClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <EmojiPicker onEmojiClick={onEmojiSelect} />
    </Popover>

    <InputBase
      sx={{ ml: 1, flex: 1, fontSize: 14 }}
      placeholder={placeholderText}
      value={inputValue}
      onChange={(event) => onInputChange(event.target.value)}
      inputRef={inputRef}
    />
    <IconButton
      type="submit"
      disabled={!inputValue.trim()}
      sx={{
        ml: 1,
        bgcolor: inputValue.trim() ? 'primary.main' : 'action.hover',
        color: inputValue.trim() ? 'white' : 'action.disabled',
        '&:hover': {
          bgcolor: inputValue.trim() ? 'primary.dark' : 'action.hover',
        },
        transition: 'all 0.2s',
        width: 40,
        height: 40,
      }}
    >
      <SendIcon fontSize="small" sx={{ transform: 'translateX(2px)' }} />
    </IconButton>
  </Paper>
);
