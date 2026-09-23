'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Stack,
  Chip,
  Button,
  IconButton,
  Divider,
  Grid,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';

import type {
  InterviewScript,
  EvaluationCriterion,
  ScriptQuestion,
} from '@/types/interviewScript';
import {
  SCENARIO_OPTIONS,
  HR_PERSONA_OPTIONS,
} from '@/types/interviewScript';

interface InterviewScriptPreviewModalProps {
  open: boolean;
  script: InterviewScript | null;
  onClose: () => void;
  onEdit?: (script: InterviewScript) => void;
  onClone?: (script: InterviewScript) => void;
}

export const InterviewScriptPreviewModal: React.FC<InterviewScriptPreviewModalProps> = ({
  open,
  script,
  onClose,
  onEdit,
  onClone,
}) => {
  if (!script) return null;

  const scenarioMeta = SCENARIO_OPTIONS.find((s) => s.type === script.scenario_type);
  const personaMeta = HR_PERSONA_OPTIONS.find((p) => p.persona === script.hr_persona);
  const rubricList: EvaluationCriterion[] = Array.isArray(script.evaluation_rubric)
    ? (script.evaluation_rubric as EvaluationCriterion[])
    : [];

  const totalRubricWeight = rubricList.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);

  const canWrite = Boolean(script.canWrite && !script.is_system_preset);

  // Questions detail extraction
  const questionsDetail: ScriptQuestion[] =
    (Array.isArray(script.question_details) && script.question_details.length > 0 ? script.question_details : null) ||
    (Array.isArray((script as { questions_detail?: unknown[] }).questions_detail) && (script as { questions_detail?: unknown[] }).questions_detail!.length > 0 ? ((script as { questions_detail?: unknown[] }).questions_detail as ScriptQuestion[]) : null) ||
    (Array.isArray(script.questionDetails) && script.questionDetails.length > 0 ? script.questionDetails : null) ||
    (Array.isArray(script.questions) && script.questions.length > 0 && typeof script.questions[0] === 'object' ? (script.questions as ScriptQuestion[]) : []);

  const totalQuestionsCount =
    questionsDetail.length ||
    script.questions_count ||
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
  const estimatedTotalMinutes = totalQuestionsCount > 0 ? Math.round((totalQuestionsCount * timeLimit) / 60) : 0;

  // Helper to highlight dynamic prompt variables
  const renderFormattedPrompt = (text: string) => {
    const parts = text.split(/(\{[a-zA-Z0-9_]+\})/g);
    return parts.map((part, index) => {
      if (/^\{[a-zA-Z0-9_]+\}$/.test(part)) {
        return (
          <Box
            key={index}
            component="span"
            sx={{
              display: 'inline-block',
              bgcolor: '#dbeafe',
              color: '#1d4ed8',
              px: 0.75,
              py: 0.1,
              borderRadius: 1,
              fontWeight: 700,
              fontFamily: 'monospace',
              fontSize: '0.82rem',
              mx: 0.25,
            }}
          >
            {part}
          </Box>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3.5,
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
          },
        },
      }}
    >
      {/* Modal Header */}
      <DialogTitle
        sx={{
          p: 2.5,
          px: 3,
          bgcolor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ pr: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 0.75, mb: 1 }}>
            {script.is_system_preset && (
              <Chip
                icon={<AutoAwesomeRoundedIcon sx={{ fontSize: '13px !important', color: '#ffffff !important' }} />}
                label="Mẫu chuẩn InfoHR"
                size="small"
                sx={{
                  bgcolor: 'primary.main',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  height: 24,
                }}
              />
            )}

            {scenarioMeta && (
              <Chip
                label={scenarioMeta.label}
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
            )}

            {personaMeta && (
              <Chip
                label={`Phong thái: ${personaMeta.label}`}
                size="small"
                sx={{
                  bgcolor: personaMeta.badgeBg,
                  color: personaMeta.badgeColor,
                  border: `1px solid ${personaMeta.borderColor}`,
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  height: 24,
                }}
              />
            )}

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

          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.25rem', lineHeight: 1.3 }}>
            {script.name}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75 }}>
            {script.description || 'Không có mô tả chi tiết'}
          </Typography>
        </Box>

        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Modal Content */}
      <DialogContent sx={{ p: 3, maxHeight: 'calc(80vh - 120px)', overflowY: 'auto' }}>
        <Stack spacing={3}>
          {/* Thông số vận hành & Thời lượng ước tính */}
          <Grid container spacing={2}>
            {/* Ước tính toàn bộ phiên phỏng vấn */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <TimerOutlinedIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                  <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 700 }}>
                    Thời lượng dự kiến
                  </Typography>
                </Stack>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#166534' }}>
                  {totalQuestionsCount > 0 ? `~${estimatedTotalMinutes} phút (${totalQuestionsCount} câu)` : 'Theo lượt phỏng vấn'}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: '#f8fafc' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <TimerOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Thời gian mỗi câu
                  </Typography>
                </Stack>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  {script.time_limit_per_question} giây
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: '#f8fafc' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Hỏi phụ đào sâu
                  </Typography>
                </Stack>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  {script.allow_ai_followup ? `Tối đa ${script.max_followup_questions} câu` : 'Không kích hoạt'}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: '#f8fafc' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <RecordVoiceOverOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Nhân vật & Giọng đọc
                  </Typography>
                </Stack>
                <Typography variant="subtitle1" noWrap sx={{ fontWeight: 800, color: 'text.primary' }}>
                  {script.character_id === 'minh_tri' ? 'Minh Trí' : 'Ngọc Linh'} • {script.voice_name} ({script.voice_speed}x)
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Chi tiết Danh sách câu hỏi */}
          {questionsDetail.length > 0 && (
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LibraryBooksOutlinedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Danh sách câu hỏi phỏng vấn ({questionsDetail.length} câu)
                  </Typography>
                </Stack>
                {questionGroupName && (
                  <Chip
                    label={`Bộ: ${questionGroupName}`}
                    size="small"
                    sx={{ bgcolor: '#eef2ff', color: '#4338ca', fontWeight: 700, fontSize: '0.75rem' }}
                  />
                )}
              </Stack>

              <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: '8%' }}>STT</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '56%' }}>Nội dung câu hỏi</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '20%' }}>Danh mục</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '16%' }}>Độ khó</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {questionsDetail.map((q, idx) => (
                      <TableRow key={q.id || idx}>
                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>#{idx + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 500, fontSize: '0.88rem' }}>
                          {q.text || (q as { question_text?: string }).question_text || (q as { title?: string }).title || `Câu hỏi #${q.id}`}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={(q as { category_display?: string }).category_display || q.category || 'Chung'}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.72rem', height: 22 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              (q as { difficulty_display?: string }).difficulty_display ||
                              (Number(q.difficulty) === 1
                                ? 'Cơ bản'
                                : Number(q.difficulty) === 2
                                ? 'Trung bình'
                                : Number(q.difficulty) === 3
                                ? 'Nâng cao'
                                : 'Trung bình')
                            }
                            size="small"
                            color={
                              Number(q.difficulty) === 3
                                ? 'error'
                                : Number(q.difficulty) === 2
                                ? 'warning'
                                : 'success'
                            }
                            sx={{ fontSize: '0.72rem', height: 22, fontWeight: 600 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}

          {/* System Prompt Section */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <PsychologyOutlinedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Chỉ dẫn AI Agent (System Prompt)
              </Typography>
            </Stack>

            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                bgcolor: '#f8fafc',
                lineHeight: 1.7,
                fontSize: '0.9rem',
                color: '#1e293b',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
              }}
            >
              {renderFormattedPrompt(script.system_prompt)}
            </Paper>
          </Box>

          {/* Lời chào & Lời cảm ơn */}
          <Grid container spacing={2}>
            {script.greeting_message && (
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75 }}>
                  LỜI CHÀO MỞ ĐẦU:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}>
                  {renderFormattedPrompt(script.greeting_message)}
                </Paper>
              </Grid>
            )}

            {script.closing_message && (
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75 }}>
                  LỜI CẢM ƠN KẾT THÚC:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.85rem' }}>
                  {renderFormattedPrompt(script.closing_message)}
                </Paper>
              </Grid>
            )}
          </Grid>

          {/* Tiêu chí đánh giá Rubric với Visual Weight Bars */}
          {rubricList.length > 0 && (
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AssessmentOutlinedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Thang tiêu chí chấm điểm (Evaluation Rubric)
                  </Typography>
                </Stack>

                <Chip
                  size="small"
                  label={
                    totalRubricWeight === 100
                      ? 'Đạt chuẩn 100%'
                      : totalRubricWeight < 100
                      ? `Tổng: ${totalRubricWeight}% (Thiếu ${100 - totalRubricWeight}%)`
                      : `Tổng: ${totalRubricWeight}% (Thừa ${totalRubricWeight - 100}%)`
                  }
                  sx={{
                    bgcolor: totalRubricWeight === 100 ? '#ecfdf5' : '#fffbeb',
                    color: totalRubricWeight === 100 ? '#10b981' : '#f59e0b',
                    border: `1px solid ${totalRubricWeight === 100 ? '#a7f3d0' : '#fde68a'}`,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                />
              </Stack>

              <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: '30%' }}>Tiêu chí</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '28%' }}>Trọng số & Tỷ lệ</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '42%' }}>Mô tả đánh giá</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rubricList.map((crit, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontWeight: 600 }}>{crit.criterion}</TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                              {crit.weight}%
                            </Typography>
                            <Box sx={{ width: '100%', height: 6, bgcolor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                              <Box
                                sx={{
                                  width: `${Math.min(crit.weight, 100)}%`,
                                  height: '100%',
                                  bgcolor: 'primary.main',
                                  borderRadius: 3,
                                }}
                              />
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
                          {crit.description || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <Divider />

      {/* Modal Actions */}
      <DialogActions sx={{ p: 2.5, px: 3, bgcolor: '#ffffff', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1}>
          {onClone && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ContentCopyOutlinedIcon />}
              onClick={() => {
                onClose();
                onClone(script);
              }}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              Nhân bản kịch bản này
            </Button>
          )}

          {canWrite && onEdit && (
            <Button
              variant="outlined"
              color="info"
              startIcon={<EditOutlinedIcon />}
              onClick={() => {
                onClose();
                onEdit(script);
              }}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              Chỉnh sửa
            </Button>
          )}
        </Stack>

        <Button
          variant="contained"
          color="inherit"
          onClick={onClose}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InterviewScriptPreviewModal;
