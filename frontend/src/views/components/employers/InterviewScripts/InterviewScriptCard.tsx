'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Stack,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import VerifiedIcon from '@mui/icons-material/Verified';
import PsychologyIcon from '@mui/icons-material/Psychology';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';

import type { InterviewScript } from '@/types/interviewScript';
import { SCENARIO_OPTIONS, HR_PERSONA_OPTIONS } from '@/types/interviewScript';

interface InterviewScriptCardProps {
  script: InterviewScript;
  onPreview: (script: InterviewScript) => void;
  onEdit: (script: InterviewScript) => void;
  onClone: (script: InterviewScript) => void;
  onDelete: (script: InterviewScript) => void;
  isCloning?: boolean;
}

export const InterviewScriptCard: React.FC<InterviewScriptCardProps> = ({
  script,
  onPreview,
  onEdit,
  onClone,
  onDelete,
  isCloning = false,
}) => {
  const scenarioMeta = SCENARIO_OPTIONS.find((s) => s.type === script.scenario_type) || {
    type: script.scenario_type,
    label: script.scenario_type,
    shortLabel: script.scenario_type,
    color: '#475569',
    bgColor: '#f8fafc',
    borderColor: '#cbd5e1',
  };

  const personaMeta = HR_PERSONA_OPTIONS.find((p) => p.persona === script.hr_persona) || {
    persona: script.hr_persona,
    label: script.hr_persona,
    tagline: '',
    badgeColor: '#2563eb',
    badgeBg: '#eff6ff',
    borderColor: '#bfdbfe',
    iconName: 'verified',
  };

  const renderPersonaIcon = () => {
    switch (script.hr_persona) {
      case 'friendly':
        return <SentimentSatisfiedAltIcon sx={{ fontSize: 15 }} />;
      case 'challenger':
        return <PsychologyIcon sx={{ fontSize: 15 }} />;
      case 'professional':
      default:
        return <VerifiedIcon sx={{ fontSize: 15 }} />;
    }
  };

  const canWrite = Boolean(script.canWrite && !script.is_system_preset);

  // Question count & Question Group
  const questionsCount =
    script.questions_count ??
    (Array.isArray(script.question_details) ? script.question_details.length : 0) ??
    (Array.isArray((script as { questions_detail?: unknown[] }).questions_detail) ? (script as { questions_detail?: unknown[] }).questions_detail!.length : 0) ??
    (Array.isArray(script.questions) ? script.questions.length : 0);

  const questionGroupName =
    script.question_group_name ||
    (typeof script.question_group === 'object' && script.question_group !== null
      ? script.question_group.name
      : undefined) ||
    script.questionGroupName ||
    (typeof script.questionGroup === 'object' && script.questionGroup !== null
      ? script.questionGroup.name
      : undefined);

  const timeLimit = script.time_limit_per_question || 120;
  const estimatedMinutes = questionsCount > 0 ? Math.round((questionsCount * timeLimit) / 60) : 0;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: script.is_system_preset ? 'primary.light' : 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.1), 0 8px 10px -6px rgba(37, 99, 235, 0.08)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5, pb: 1.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Badges row */}
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 0.75, mb: 1.5 }}>
          {/* System Preset Badge */}
          {script.is_system_preset && (
            <Chip
              icon={<AutoAwesomeRoundedIcon sx={{ fontSize: '14px !important', color: '#ffffff !important' }} />}
              label="Mẫu InfoHR"
              size="small"
              sx={{
                bgcolor: 'primary.main',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.72rem',
                height: 24,
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
              }}
            />
          )}

          {/* Scenario Type Badge */}
          <Chip
            label={scenarioMeta.shortLabel}
            size="small"
            sx={{
              bgcolor: scenarioMeta.bgColor,
              color: scenarioMeta.color,
              border: `1px solid ${scenarioMeta.borderColor}`,
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 24,
            }}
          />

          {/* HR Persona Badge */}
          <Chip
            icon={renderPersonaIcon()}
            label={personaMeta.label}
            size="small"
            sx={{
              bgcolor: personaMeta.badgeBg,
              color: personaMeta.badgeColor,
              border: `1px solid ${personaMeta.borderColor}`,
              fontWeight: 600,
              fontSize: '0.72rem',
              height: 24,
              '& .MuiChip-icon': {
                color: 'inherit',
                ml: 0.75,
              },
            }}
          />

          {/* Question Group Badge if linked */}
          {questionGroupName && (
            <Chip
              icon={<LibraryBooksOutlinedIcon sx={{ fontSize: '13px !important', color: '#4338ca !important' }} />}
              label={questionGroupName}
              size="small"
              sx={{
                bgcolor: '#eef2ff',
                color: '#4338ca',
                border: '1px solid #c7d2fe',
                fontWeight: 700,
                fontSize: '0.72rem',
                height: 24,
              }}
            />
          )}
        </Stack>

        {/* Title */}
        <Tooltip title={script.name} placement="top" arrow enterDelay={400}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              fontSize: '1.05rem',
              lineHeight: 1.35,
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              cursor: 'pointer',
              '&:hover': {
                color: 'primary.main',
              },
            }}
            onClick={() => onPreview(script)}
          >
            {script.name}
          </Typography>
        </Tooltip>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.84rem',
            lineHeight: 1.5,
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          {script.description || 'Không có mô tả chi tiết cho kịch bản này.'}
        </Typography>

        {/* Metrics Grid */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: '#f8fafc',
            border: '1px solid #f1f5f9',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1.25,
            mb: 1,
          }}
        >
          {/* Estimated Duration & Question count */}
          <Stack direction="row" spacing={1} alignItems="center">
            <TimerOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.78rem' }}>
              {questionsCount > 0 ? `⏱️ ~${estimatedMinutes} phút (${questionsCount} câu)` : '⏱️ Bộ câu hỏi động'}
            </Typography>
          </Stack>

          {/* Time limit per question */}
          <Stack direction="row" spacing={1} alignItems="center">
            <HelpOutlineOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.78rem' }}>
              {script.time_limit_per_question}s / câu
            </Typography>
          </Stack>

          {/* Follow up status */}
          <Stack direction="row" spacing={1} alignItems="center">
            <ChatBubbleOutlineOutlinedIcon
              sx={{
                fontSize: 16,
                color: script.allow_ai_followup ? 'success.main' : 'text.disabled',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: script.allow_ai_followup ? 'text.primary' : 'text.secondary',
                fontSize: '0.78rem',
              }}
            >
              {script.allow_ai_followup ? `Hỏi sâu: Tối đa ${script.max_followup_questions}` : 'Hỏi sâu: Tắt'}
            </Typography>
          </Stack>

          {/* Voice & Persona */}
          <Stack direction="row" spacing={1} alignItems="center">
            <RecordVoiceOverOutlinedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography
              variant="caption"
              noWrap
              sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.78rem' }}
            >
              {script.voice_name || 'Trúc Ly'} ({script.voice_speed || 1.0}x)
            </Typography>
          </Stack>
        </Box>
      </CardContent>

      <Divider sx={{ borderColor: '#f1f5f9' }} />

      {/* Card Actions */}
      <CardActions sx={{ px: 2, py: 1.25, justifyContent: 'space-between', bgcolor: '#fafafa' }}>
        <Button
          size="small"
          variant="text"
          color="primary"
          startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 17 }} />}
          onClick={() => onPreview(script)}
          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', borderRadius: 1.5 }}
        >
          Xem chi tiết
        </Button>

        <Stack direction="row" spacing={0.5} alignItems="center">
          {/* Clone button */}
          <Tooltip title="1-Click Nhân bản kịch bản này" arrow>
            <span>
              <IconButton
                size="small"
                color="primary"
                onClick={() => onClone(script)}
                disabled={isCloning}
                sx={{
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  '&:hover': { bgcolor: '#eff6ff', borderColor: 'primary.main' },
                }}
              >
                <ContentCopyOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </span>
          </Tooltip>

          {/* Edit button */}
          {canWrite && (
            <Tooltip title="Chỉnh sửa kịch bản" arrow>
              <IconButton
                size="small"
                color="info"
                onClick={() => onEdit(script)}
                sx={{
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  '&:hover': { bgcolor: '#f0f9ff', borderColor: 'info.main' },
                }}
              >
                <EditOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}

          {/* Delete button */}
          {canWrite && (
            <Tooltip title="Xóa kịch bản" arrow>
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(script)}
                sx={{
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  '&:hover': { bgcolor: '#fef2f2', borderColor: 'error.main' },
                }}
              >
                <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </CardActions>
    </Card>
  );
};

export default InterviewScriptCard;
