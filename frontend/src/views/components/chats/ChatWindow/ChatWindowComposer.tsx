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
import { useTranslation } from 'react-i18next';

type ChatWindowComposerProps = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
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
}: ChatWindowComposerProps) => {
  const { t } = useTranslation('chat');

  return (
    <Paper
      component="form"
      onSubmit={onSubmit}
      elevation={0}
      sx={{
        p: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        borderTop: 1,
        borderColor: 'rgba(148, 163, 184, 0.24)',
        bgcolor: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 -8px 24px rgba(15, 23, 42, 0.05)',
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        aria-label={t('composer.attachFile')}
        style={{ display: 'none' }}
        onChange={onFileUpload}
      />
      <IconButton
        size="small"
        aria-label={t('composer.attachFile')}
        sx={{ mr: 1, bgcolor: 'rgba(37, 99, 235, 0.08)', color: '#2563eb', '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.14)' } }}
        disabled={isUploading}
        onClick={onOpenFilePicker}
      >
        {isUploading ? (
          <CircularProgress size={20} variant="determinate" value={uploadProgress} />
        ) : (
          <AttachFileIcon fontSize="small" />
        )}
      </IconButton>
      <IconButton size="small" aria-label={t('composer.chooseEmoji')} sx={{ mr: 1, bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#d97706', '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.16)' } }} onClick={onEmojiClick}>
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
        sx={{
          ml: 1,
          flex: 1,
          fontSize: 14,
          px: 1.5,
          py: 0.75,
          borderRadius: 999,
          bgcolor: '#f8fafc',
          border: '1px solid rgba(148, 163, 184, 0.28)',
          color: '#0f172a',
          '& input::placeholder': { color: '#94a3b8', opacity: 1 },
        }}
        placeholder={placeholderText}
        inputProps={{ 'aria-label': placeholderText }}
        value={inputValue}
        onChange={(event) => onInputChange(event.target.value)}
        inputRef={inputRef}
      />
      <IconButton
        type="submit"
        aria-label={t('composer.sendMessage')}
        disabled={!inputValue.trim()}
        sx={{
          ml: 1,
          bgcolor: inputValue.trim() ? '#2563eb' : 'rgba(148, 163, 184, 0.18)',
          color: inputValue.trim() ? 'white' : 'action.disabled',
          '&:hover': {
            bgcolor: inputValue.trim() ? '#1d4ed8' : 'rgba(148, 163, 184, 0.22)',
          },
          transition: 'all 0.2s',
          width: 40,
          height: 40,
          boxShadow: inputValue.trim() ? '0 8px 18px rgba(37, 99, 235, 0.22)' : 'none',
        }}
      >
        <SendIcon fontSize="small" sx={{ transform: 'translateX(2px)' }} />
      </IconButton>
    </Paper>
  );
};
