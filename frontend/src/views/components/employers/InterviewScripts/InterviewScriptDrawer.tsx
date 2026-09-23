'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Stack,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Divider,
  Grid,
  Slider,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';

import type {
  InterviewScript,
  InterviewScriptInput,
  ScenarioType,
  HrPersona,
  EvaluationCriterion,
} from '@/types/interviewScript';
import {
  SCENARIO_OPTIONS,
  HR_PERSONA_OPTIONS,
  DYNAMIC_PROMPT_VARIABLES,
} from '@/types/interviewScript';
import type { QuestionGroup, Question } from '@/types/models';
import questionGroupService from '@/services/questionGroupService';
import questionService from '@/services/questionService';
import { PRESET_VOICES, DIGITAL_HUMAN_CHARACTERS } from '@/services/employerAiSettingService';
import toastMessages from '@/utils/toastMessages';

interface InterviewScriptDrawerProps {
  open: boolean;
  script: InterviewScript | null;
  onClose: () => void;
  onSubmit: (data: InterviewScriptInput) => Promise<void>;
  isLoading?: boolean;
}

const DEFAULT_RUBRIC: EvaluationCriterion[] = [
  { criterion: 'Kiến thức & Kỹ năng cốt lõi', weight: 40, description: 'Đánh giá mức độ vững vàng về chuyên môn của vị trí' },
  { criterion: 'Tư duy logic & Giải quyết vấn đề', weight: 35, description: 'Phân tích nguyên nhân và đưa ra giải pháp khả thi' },
  { criterion: 'Thái độ & Tương tác văn hóa', weight: 25, description: 'Tinh thần trách nhiệm, lắng nghe và hợp tác' },
];

export const InterviewScriptDrawer: React.FC<InterviewScriptDrawerProps> = ({
  open,
  script,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const isEditing = Boolean(script);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scenarioType, setScenarioType] = useState<ScenarioType>('technical');
  const [hrPersona, setHrPersona] = useState<HrPersona>('professional');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [greetingMessage, setGreetingMessage] = useState('');
  const [closingMessage, setClosingMessage] = useState('');
  const [timeLimitPerQuestion, setTimeLimitPerQuestion] = useState(120);
  const [allowAiFollowup, setAllowAiFollowup] = useState(true);
  const [maxFollowupQuestions, setMaxFollowupQuestions] = useState(2);
  const [characterId, setCharacterId] = useState('ng_c_linh');
  const [voiceName, setVoiceName] = useState('Trúc Ly');
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [rubric, setRubric] = useState<EvaluationCriterion[]>(DEFAULT_RUBRIC);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Question Groups & Question Bank integration
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([]);
  const [loadingQuestionGroups, setLoadingQuestionGroups] = useState(false);
  const [selectedQuestionGroupId, setSelectedQuestionGroupId] = useState<number | ''>('');
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);

  // Company Identity Inheritance (Default: true)
  const [inheritCompanyIdentity, setInheritCompanyIdentity] = useState<boolean>(true);

  const promptTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Fetch question groups and questions when Drawer opens
  useEffect(() => {
    if (open) {
      setLoadingQuestionGroups(true);
      questionGroupService
        .getQuestionGroups({ pageSize: 100 })
        .then((res) => {
          const items = (res as { results?: QuestionGroup[] })?.results || (Array.isArray(res) ? res : []);
          setQuestionGroups(items);
        })
        .catch((err: unknown) => {
          console.error('Failed to load question groups', err);
        })
        .finally(() => {
          setLoadingQuestionGroups(false);
        });

      setLoadingQuestions(true);
      questionService
        .getQuestions({ pageSize: 100 })
        .then((res) => {
          const items = (res as { results?: Question[] })?.results || (Array.isArray(res) ? res : []);
          setAvailableQuestions(items);
        })
        .catch((err: unknown) => {
          console.error('Failed to load questions', err);
        })
        .finally(() => {
          setLoadingQuestions(false);
        });
    }
  }, [open]);

  // Sync form when script prop changes
  useEffect(() => {
    if (script) {
      setName(script.name || '');
      setDescription(script.description || '');
      setScenarioType(script.scenario_type || 'technical');
      setHrPersona(script.hr_persona || 'professional');
      setSystemPrompt(script.system_prompt || '');
      setGreetingMessage(script.greeting_message || '');
      setClosingMessage(script.closing_message || '');
      setTimeLimitPerQuestion(script.time_limit_per_question || 120);
      setAllowAiFollowup(script.allow_ai_followup ?? true);
      setMaxFollowupQuestions(script.max_followup_questions || 2);
      setCharacterId(script.character_id || 'ng_c_linh');
      setVoiceName(script.voice_name || 'Trúc Ly');
      setVoiceSpeed(script.voice_speed || 1.0);

      // Question group
      const initialGroupId =
        typeof script.question_group === 'object' && script.question_group !== null
          ? script.question_group.id
          : typeof script.question_group === 'number'
          ? script.question_group
          : typeof script.questionGroup === 'object' && script.questionGroup !== null
          ? script.questionGroup.id
          : typeof script.questionGroup === 'number'
          ? script.questionGroup
          : '';
      setSelectedQuestionGroupId(initialGroupId || '');

      // Question IDs
      const rawQIds =
        script.question_ids ||
        script.questionIds ||
        (Array.isArray(script.questions)
          ? script.questions.map((q: unknown) => (typeof q === 'object' && q !== null && 'id' in q ? (q as { id: number }).id : Number(q)))
          : []) ||
        (Array.isArray(script.question_details)
          ? script.question_details.map((q) => q.id)
          : []);
      setSelectedQuestionIds(rawQIds.filter((id: unknown) => Boolean(id) && !isNaN(Number(id))).map(Number));

      // Inherit company identity
      const initialInherit =
        script.inherit_company_identity !== undefined
          ? Boolean(script.inherit_company_identity)
          : script.inheritCompanyIdentity !== undefined
          ? Boolean(script.inheritCompanyIdentity)
          : true;
      setInheritCompanyIdentity(initialInherit);

      if (Array.isArray(script.evaluation_rubric) && script.evaluation_rubric.length > 0) {
        setRubric(script.evaluation_rubric as EvaluationCriterion[]);
      } else {
        setRubric(DEFAULT_RUBRIC);
      }
      setErrorText(null);
    } else {
      // Reset for create
      setName('');
      setDescription('');
      setScenarioType('technical');
      setHrPersona('professional');
      setSystemPrompt(
        'Bạn là {interviewer_name}, chuyên viên tuyển dụng AI tại {company_name}. Hãy phỏng vấn ứng viên {candidate_name} cho vị trí {job_title}. Hãy lắng nghe cẩn thận, đặt câu hỏi đào sâu nếu câu trả lời chưa rõ ràng và duy trì phong thái chuyên nghiệp, khách quan.'
      );
      setGreetingMessage('Xin chào {candidate_name}! Tôi là {interviewer_name} từ {company_name}. Chúc bạn có buổi phỏng vấn tự tin và hiệu quả!');
      setClosingMessage('Cảm ơn {candidate_name} đã tham gia buổi phỏng vấn hôm nay. Kết quả đánh giá sẽ được thông báo sớm nhất!');
      setTimeLimitPerQuestion(120);
      setAllowAiFollowup(true);
      setMaxFollowupQuestions(2);
      setSelectedQuestionGroupId('');
      setSelectedQuestionIds([]);
      setInheritCompanyIdentity(true);
      setCharacterId('ng_c_linh');
      setVoiceName('Trúc Ly');
      setVoiceSpeed(1.0);
      setRubric(DEFAULT_RUBRIC);
      setErrorText(null);
    }
  }, [script, open]);

  // Insert dynamic variable at current textarea cursor position
  const handleInsertVariable = (variableKey: string) => {
    const textarea = promptTextareaRef.current;
    if (!textarea) {
      setSystemPrompt((prev) => `${prev} ${variableKey}`);
      return;
    }

    const startPos = textarea.selectionStart ?? systemPrompt.length;
    const endPos = textarea.selectionEnd ?? systemPrompt.length;
    const before = systemPrompt.substring(0, startPos);
    const after = systemPrompt.substring(endPos, systemPrompt.length);
    const updated = `${before}${variableKey}${after}`;
    setSystemPrompt(updated);

    setTimeout(() => {
      textarea.focus();
      const newPos = startPos + variableKey.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Handle Question Group Selection
  const handleQuestionGroupChange = (groupId: number | '') => {
    setSelectedQuestionGroupId(groupId);
    if (groupId !== '') {
      const group = questionGroups.find((g) => g.id === groupId);
      if (group && Array.isArray(group.questions) && group.questions.length > 0) {
        const groupQIds = group.questions.map((q) => q.id);
        setSelectedQuestionIds(groupQIds);
      }
    }
  };

  // Selected Question Group object
  const selectedGroup = questionGroups.find((g) => g.id === selectedQuestionGroupId);
  const selectedGroupQuestions = selectedGroup && Array.isArray(selectedGroup.questions) ? selectedGroup.questions : [];

  // All questions to display: combine selected group questions + any extra questions chosen
  const displayedQuestions = useMemo(() => {
    const map = new Map<number, Question | { id: number; text: string; category?: string; difficulty?: number | string }>();

    // 1. Group questions first
    if (selectedGroupQuestions.length > 0) {
      selectedGroupQuestions.forEach((q) => map.set(q.id, q));
    }

    // 2. Available questions from bank matching selectedQuestionIds
    availableQuestions.forEach((q) => {
      if (selectedQuestionIds.includes(q.id)) {
        map.set(q.id, q);
      }
    });

    // 3. From script if editing
    if (script && Array.isArray(script.question_details)) {
      script.question_details.forEach((q) => {
        if (selectedQuestionIds.includes(q.id)) {
          map.set(q.id, q);
        }
      });
    }

    // 4. Any remaining selectedQuestionIds
    selectedQuestionIds.forEach((id) => {
      if (!map.has(id)) {
        map.set(id, { id, text: `Câu hỏi #${id}` });
      }
    });

    return Array.from(map.values());
  }, [selectedGroupQuestions, availableQuestions, selectedQuestionIds, script]);

  // Total questions count & calculated duration
  const totalQuestionsCount = selectedQuestionIds.length > 0 ? selectedQuestionIds.length : displayedQuestions.length;
  const totalDurationSeconds = totalQuestionsCount * timeLimitPerQuestion;
  const estimatedDurationMinutes = Math.round(totalDurationSeconds / 60);

  // Rubric management
  const handleAddCriterion = () => {
    setRubric((prev) => [
      ...prev,
      { criterion: 'Tiêu chí đánh giá mới', weight: 10, description: 'Mô tả yêu cầu đạt chuẩn' },
    ]);
  };

  const handleUpdateCriterion = (index: number, field: keyof EvaluationCriterion, value: string | number) => {
    setRubric((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveCriterion = (index: number) => {
    setRubric((prev) => prev.filter((_, i) => i !== index));
  };

  // Smart Rubric Builder: Auto-balance 100%
  const handleAutoBalanceRubric = () => {
    if (rubric.length === 0) return;
    const count = rubric.length;
    const base = Math.floor(100 / count);
    const remainder = 100 % count;
    const updated = rubric.map((item, index) => ({
      ...item,
      weight: index < remainder ? base + 1 : base,
    }));
    setRubric(updated);
  };

  const totalRubricWeight = rubric.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);

  // Rubric status color and message
  const rubricStatus = useMemo(() => {
    if (totalRubricWeight === 100) {
      return {
        color: '#10b981',
        message: 'Đạt chuẩn 100%',
        badgeBg: '#ecfdf5',
        badgeBorder: '#a7f3d0',
      };
    }
    if (totalRubricWeight < 100) {
      return {
        color: '#f59e0b',
        message: `Thiếu ${100 - totalRubricWeight}%`,
        badgeBg: '#fffbeb',
        badgeBorder: '#fde68a',
      };
    }
    return {
      color: '#ef4444',
      message: `Thừa ${totalRubricWeight - 100}%`,
      badgeBg: '#fef2f2',
      badgeBorder: '#fecaca',
    };
  }, [totalRubricWeight]);

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);

    if (!name.trim()) {
      setErrorText('Vui lòng nhập tên kịch bản phỏng vấn');
      return;
    }

    if (!systemPrompt.trim()) {
      setErrorText('Vui lòng soạn thảo chỉ dẫn AI (System Prompt)');
      return;
    }

    if (totalRubricWeight !== 100) {
      toastMessages.warn(
        `Tổng trọng số tiêu chí đánh giá hiện tại là ${totalRubricWeight}%. Khuyến nghị nên cân đối về 100% để thang điểm chính xác.`
      );
    }

    const payload: InterviewScriptInput = {
      name: name.trim(),
      description: description.trim(),
      scenario_type: scenarioType,
      hr_persona: hrPersona,
      system_prompt: systemPrompt.trim(),
      greeting_message: greetingMessage.trim(),
      closing_message: closingMessage.trim(),
      time_limit_per_question: Number(timeLimitPerQuestion) || 120,
      allow_ai_followup: Boolean(allowAiFollowup),
      max_followup_questions: Number(maxFollowupQuestions) || 2,
      question_group: selectedQuestionGroupId ? Number(selectedQuestionGroupId) : null,
      question_ids: selectedQuestionIds,
      inherit_company_identity: inheritCompanyIdentity,
      inheritCompanyIdentity: inheritCompanyIdentity,
      character_id: characterId,
      voice_name: voiceName,
      voice_speed: Number(voiceSpeed) || 1.0,
      evaluation_rubric: rubric,
      is_active: true,
      // camelCase accessors for seamless compatibility
      questionGroup: selectedQuestionGroupId ? Number(selectedQuestionGroupId) : null,
      questionIds: selectedQuestionIds,
      timeLimitPerQuestion: Number(timeLimitPerQuestion) || 120,
      allowAiFollowup: Boolean(allowAiFollowup),
      maxFollowupQuestions: Number(maxFollowupQuestions) || 2,
      scenarioType: scenarioType,
      hrPersona: hrPersona,
      systemPrompt: systemPrompt.trim(),
      greetingMessage: greetingMessage.trim(),
      closingMessage: closingMessage.trim(),
      characterId: characterId,
      voiceName: voiceName,
      voiceSpeed: Number(voiceSpeed) || 1.0,
      evaluationRubric: rubric,
      isActive: true,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu kịch bản';
      setErrorText(msg);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 620, md: 760 },
            maxWidth: '100vw',
            bgcolor: '#ffffff',
            boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.12)',
          },
        },
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            p: 2.5,
            px: 3,
            borderBottom: '1px solid #e2e8f0',
            bgcolor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                bgcolor: 'primary.main',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PsychologyOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.15rem' }}>
                {isEditing ? 'Chỉnh sửa kịch bản phỏng vấn' : 'Tạo kịch bản phỏng vấn AI mới'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {isEditing ? `Mã kịch bản: #${script?.id}` : 'Thiết lập câu hỏi, chỉ dẫn và phong thái cho AI Agent'}
              </Typography>
            </Box>
          </Stack>

          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Drawer Body */}
        <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
          <Stack spacing={3.5}>
            {errorText && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {errorText}
              </Alert>
            )}

            {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'primary.main',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <TuneOutlinedIcon sx={{ fontSize: 18 }} />
                1. Thông tin kịch bản & Định hướng
              </Typography>

              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Tên kịch bản phỏng vấn *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Kịch bản Sơ loại Kỹ thuật Senior Backend"
                  size="small"
                  required
                />

                <TextField
                  fullWidth
                  label="Mục tiêu & Đối tượng áp dụng"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tóm tắt ngắn gọn mục tiêu kịch bản và vị trí tuyển dụng phù hợp"
                  multiline
                  rows={2}
                  size="small"
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="scenario-type-label">Phân loại kịch bản</InputLabel>
                      <Select
                        labelId="scenario-type-label"
                        value={scenarioType}
                        label="Phân loại kịch bản"
                        onChange={(e) => setScenarioType(e.target.value as ScenarioType)}
                      >
                        {SCENARIO_OPTIONS.map((opt) => (
                          <MenuItem key={opt.type} value={opt.type}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {opt.label}
                            </Typography>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="hr-persona-label">Phong thái người phỏng vấn AI</InputLabel>
                      <Select
                        labelId="hr-persona-label"
                        value={hrPersona}
                        label="Phong thái người phỏng vấn AI"
                        onChange={(e) => setHrPersona(e.target.value as HrPersona)}
                      >
                        {HR_PERSONA_OPTIONS.map((opt) => (
                          <MenuItem key={opt.persona} value={opt.persona}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {opt.label}
                            </Typography>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Stack>
            </Box>

            <Divider />

            {/* PHẦN 2: GẮN BỘ CÂU HỎI & NGÂN HÀNG CÂU HỎI */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'primary.main',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <LibraryBooksOutlinedIcon sx={{ fontSize: 18 }} />
                2. Gắn Bộ câu hỏi & Ngân hàng câu hỏi
              </Typography>

              <Stack spacing={2.5}>
                {/* Question Group Picker */}
                <FormControl fullWidth size="small">
                  <InputLabel id="question-group-select-label">Bộ câu hỏi liên kết</InputLabel>
                  <Select
                    labelId="question-group-select-label"
                    value={selectedQuestionGroupId}
                    label="Bộ câu hỏi liên kết"
                    onChange={(e) => handleQuestionGroupChange(e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={loadingQuestionGroups}
                  >
                    <MenuItem value="">
                      <em>-- Không liên kết bộ câu hỏi --</em>
                    </MenuItem>
                    {questionGroups.map((g) => (
                      <MenuItem key={g.id} value={g.id}>
                        {g.name} ({g.questions_count ?? (Array.isArray(g.questions) ? g.questions.length : 0)} câu)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Question Bank Picker (Detailed questions) */}
                <FormControl fullWidth size="small">
                  <InputLabel id="question-bank-select-label">Chọn thêm câu hỏi từ Ngân hàng câu hỏi</InputLabel>
                  <Select
                    labelId="question-bank-select-label"
                    multiple
                    value={selectedQuestionIds}
                    onChange={(e) => {
                      const val = e.target.value;
                      const ids = typeof val === 'string' ? val.split(',').map(Number) : (val as number[]);
                      setSelectedQuestionIds(ids);
                    }}
                    input={<OutlinedInput label="Chọn thêm câu hỏi từ Ngân hàng câu hỏi" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as number[]).map((id) => {
                          const q =
                            availableQuestions.find((item) => item.id === id) ||
                            displayedQuestions.find((item) => item.id === id);
                          return (
                            <Chip
                              key={id}
                              size="small"
                              label={q?.text ? `${id}: ${q.text.slice(0, 30)}...` : `Câu hỏi #${id}`}
                              onDelete={(e) => {
                                e.stopPropagation();
                                setSelectedQuestionIds((prev) => prev.filter((item) => item !== id));
                              }}
                            />
                          );
                        })}
                      </Box>
                    )}
                    disabled={loadingQuestions}
                  >
                    {availableQuestions.map((q) => (
                      <MenuItem key={q.id} value={q.id}>
                        <Checkbox checked={selectedQuestionIds.includes(q.id)} size="small" />
                        <ListItemText
                          primary={q.text || q.question_text || `Câu hỏi #${q.id}`}
                          secondary={`${q.category_display || q.category || 'Chung'} • Độ khó: ${q.difficulty_display || q.difficulty || 'Trung bình'}`}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Selected Question Group & Questions Summary */}
                {selectedGroup && (
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0' }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Bộ câu hỏi đã chọn: {selectedGroup.name}
                      </Typography>
                      <Chip
                        label={`${selectedGroupQuestions.length} câu hỏi`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 700 }}
                      />
                    </Stack>

                    {selectedGroupQuestions.length > 0 ? (
                      <Stack spacing={1}>
                        {selectedGroupQuestions.map((q, idx) => (
                          <Box
                            key={q.id || idx}
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 1.25,
                              p: 1,
                              borderRadius: 1.5,
                              bgcolor: '#ffffff',
                              border: '1px solid #f1f5f9',
                            }}
                          >
                            <Chip
                              size="small"
                              label={`#${idx + 1}`}
                              sx={{ height: 20, fontSize: '0.72rem', fontWeight: 700 }}
                            />
                            <Typography variant="body2" sx={{ fontSize: '0.84rem', color: 'text.primary', flex: 1 }}>
                              {q.text || q.question_text || `Câu hỏi #${q.id}`}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Bộ câu hỏi này chưa có câu hỏi trực tiếp nào.
                      </Typography>
                    )}
                  </Paper>
                )}

                {/* Calculated Duration Preview Banner */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <TimerOutlinedIcon sx={{ color: '#16a34a', fontSize: 26 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#15803d' }}>
                      Thời lượng ước tính: {totalQuestionsCount} câu × {timeLimitPerQuestion}s = ~{estimatedDurationMinutes} phút
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#166534', display: 'block', mt: 0.25 }}>
                      Tính toán trực quan dựa trên số lượng câu hỏi và thời gian trả lời tối đa mỗi câu
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* PHẦN 3: TRÌNH SOẠN THẢO PROMPT VỚI VARIABLE CHIPS */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <AutoAwesomeOutlinedIcon sx={{ fontSize: 18 }} />
                  3. Chỉ dẫn chuyên sâu cho AI (System Prompt) *
                </Typography>
              </Stack>

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                Bấm vào các thẻ biến số bên dưới để tự động chèn vào vị trí con trỏ trong khung soạn thảo:
              </Typography>

              {/* Dynamic Variable Chips */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.75,
                  p: 1.5,
                  mb: 1.5,
                  borderRadius: 2.5,
                  bgcolor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                }}
              >
                {DYNAMIC_PROMPT_VARIABLES.map((v) => (
                  <Chip
                    key={v.key}
                    label={`${v.key} (${v.label})`}
                    size="small"
                    clickable
                    color="primary"
                    variant="outlined"
                    onClick={() => handleInsertVariable(v.key)}
                    sx={{
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      fontSize: '0.74rem',
                      bgcolor: '#ffffff',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: '#ffffff',
                      },
                    }}
                  />
                ))}
              </Box>

              <TextField
                inputRef={promptTextareaRef}
                fullWidth
                multiline
                rows={6}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Nhập hướng dẫn phỏng vấn cho AI Agent..."
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'inherit',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                  },
                }}
                required
              />

              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.75, display: 'block' }}>
                Hệ thống LiveKit Voice AI sẽ tự động thay thế các biến số theo hồ sơ ứng viên và tin tuyển dụng khi mở phòng phỏng vấn.
              </Typography>
            </Box>

            <Divider />

            {/* PHẦN 4: LỜI CHÀO MỞ ĐẦU & LỜI CẢM ƠN KẾT THÚC */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'primary.main',
                  mb: 2,
                }}
              >
                4. Lời thoại chào đón & Kết thúc phiên
              </Typography>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Lời chào mở đầu khi ứng viên vào phòng"
                  value={greetingMessage}
                  onChange={(e) => setGreetingMessage(e.target.value)}
                  placeholder="Ví dụ: Xin chào {candidate_name}! Tôi là {interviewer_name}..."
                  multiline
                  rows={2}
                  size="small"
                />

                <TextField
                  fullWidth
                  label="Lời cảm ơn & Thông báo kết thúc phỏng vấn"
                  value={closingMessage}
                  onChange={(e) => setClosingMessage(e.target.value)}
                  placeholder="Ví dụ: Cảm ơn {candidate_name} đã tham gia phỏng vấn..."
                  multiline
                  rows={2}
                  size="small"
                />
              </Stack>
            </Box>

            <Divider />

            {/* PHẦN 5: THỜI LƯỢNG & ĐIỀU PHỐI AI */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'primary.main',
                  mb: 2,
                }}
              >
                5. Cấu hình thời gian & Hỏi đào sâu (Follow-up)
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Thời gian trả lời mỗi câu: {timeLimitPerQuestion} giây
                  </Typography>
                  <Slider
                    value={timeLimitPerQuestion}
                    min={30}
                    max={300}
                    step={15}
                    onChange={(_, val) => setTimeLimitPerQuestion(val as number)}
                    valueLabelDisplay="auto"
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Khuyến nghị: 90s - 180s cho câu hỏi chuyên môn
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={allowAiFollowup}
                        onChange={(e) => setAllowAiFollowup(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Cho phép AI hỏi phụ đào sâu
                      </Typography>
                    }
                  />

                  {allowAiFollowup && (
                    <Box sx={{ mt: 1.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                        Số câu hỏi phụ tối đa: {maxFollowupQuestions} câu
                      </Typography>
                      <Slider
                        value={maxFollowupQuestions}
                        min={1}
                        max={5}
                        step={1}
                        marks
                        onChange={(_, val) => setMaxFollowupQuestions(val as number)}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* PHẦN 6: NHÂN VẬT & GIỌNG ĐỌC AI (KẾ THỪA CÔNG TY) */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'primary.main',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <RecordVoiceOverOutlinedIcon sx={{ fontSize: 18 }} />
                6. Trợ lý Phỏng vấn Aila & Giọng đọc
              </Typography>

              {/* Company Identity Inheritance Switch */}
              <Box sx={{ mb: 2.5 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={inheritCompanyIdentity}
                      onChange={(e) => setInheritCompanyIdentity(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Kế thừa Giọng nói & Nhân vật từ Doanh nghiệp
                    </Typography>
                  }
                />

                {inheritCompanyIdentity ? (
                  <Alert
                    severity="info"
                    icon={<BusinessOutlinedIcon fontSize="inherit" />}
                    sx={{
                      mt: 1.5,
                      borderRadius: 2.5,
                      bgcolor: '#eff6ff',
                      color: '#1e40af',
                      border: '1px solid #bfdbfe',
                      fontWeight: 500,
                      fontSize: '0.85rem',
                    }}
                  >
                    Kịch bản sẽ tự động áp dụng Giọng đọc, Tốc độ và Nhân vật AI được thiết lập trong trang Cài đặt AI của Doanh nghiệp
                  </Alert>
                ) : (
                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="character-select-label">Nhân vật AI</InputLabel>
                        <Select
                          labelId="character-select-label"
                          value={characterId}
                          label="Nhân vật AI"
                          onChange={(e) => setCharacterId(e.target.value)}
                        >
                          {DIGITAL_HUMAN_CHARACTERS.map((char) => (
                            <MenuItem key={char.id} value={char.id}>
                              {char.name} ({char.titleVi})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="voice-select-label">Giọng đọc</InputLabel>
                        <Select
                          labelId="voice-select-label"
                          value={voiceName}
                          label="Giọng đọc"
                          onChange={(e) => setVoiceName(e.target.value)}
                        >
                          {PRESET_VOICES.map((v) => (
                            <MenuItem key={v.id} value={v.name}>
                              {v.name} ({v.regionVi})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="speed-select-label">Tốc độ phát âm</InputLabel>
                        <Select
                          labelId="speed-select-label"
                          value={voiceSpeed}
                          label="Tốc độ phát âm"
                          onChange={(e) => setVoiceSpeed(Number(e.target.value))}
                        >
                          <MenuItem value={0.85}>0.85x (Chậm rãi)</MenuItem>
                          <MenuItem value={0.95}>0.95x (Tự nhiên nhẹ)</MenuItem>
                          <MenuItem value={1.0}>1.0x (Tiêu chuẩn)</MenuItem>
                          <MenuItem value={1.05}>1.05x (Nhanh nhẹn)</MenuItem>
                          <MenuItem value={1.15}>1.15x (Dứt khoát)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                )}
              </Box>
            </Box>

            <Divider />

            {/* PHẦN 7: TIÊU CHÍ ĐÁNH GIÁ RUBRIC (SMART RUBRIC BUILDER) */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'primary.main',
                    }}
                  >
                    7. Thang tiêu chuẩn đánh giá Rubric (Smart Rubric)
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Tự động chuẩn hóa và tính điểm ứng viên theo thang 100%
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ElectricBoltIcon sx={{ color: '#6366f1' }} />}
                    onClick={handleAutoBalanceRubric}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: 2,
                      borderColor: '#c7d2fe',
                      color: '#4338ca',
                      bgcolor: '#eef2ff',
                      '&:hover': { bgcolor: '#e0e7ff', borderColor: '#818cf8' },
                    }}
                  >
                    ⚡ Tự động chia đều 100%
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleAddCriterion}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                  >
                    Thêm tiêu chí
                  </Button>
                </Stack>
              </Stack>

              {/* Visual Rubric Progress Bar */}
              <Box sx={{ p: 2, mb: 2, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Tổng trọng số rubric:{' '}
                    <Box component="span" sx={{ color: rubricStatus.color, fontWeight: 800 }}>
                      {totalRubricWeight}%
                    </Box>
                  </Typography>

                  <Chip
                    size="small"
                    label={rubricStatus.message}
                    sx={{
                      bgcolor: rubricStatus.badgeBg,
                      color: rubricStatus.color,
                      border: `1px solid ${rubricStatus.badgeBorder}`,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      height: 24,
                    }}
                  />
                </Stack>

                <Box
                  sx={{
                    width: '100%',
                    height: 10,
                    bgcolor: '#e2e8f0',
                    borderRadius: 5,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      width: `${Math.min(totalRubricWeight, 100)}%`,
                      height: '100%',
                      bgcolor: rubricStatus.color,
                      borderRadius: 5,
                      transition: 'all 0.3s ease',
                    }}
                  />
                </Box>
              </Box>

              <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: '40%' }}>Tên tiêu chí</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '20%' }}>Trọng số (%)</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '35%' }}>Mô tả đánh giá</TableCell>
                      <TableCell sx={{ width: '5%' }} align="center"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rubric.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            value={item.criterion}
                            onChange={(e) => handleUpdateCriterion(idx, 'criterion', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            slotProps={{ htmlInput: { min: 5, max: 100, step: 5 } }}
                            value={item.weight}
                            onChange={(e) => handleUpdateCriterion(idx, 'weight', Number(e.target.value))}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            value={item.description || ''}
                            onChange={(e) => handleUpdateCriterion(idx, 'description', e.target.value)}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            disabled={rubric.length <= 1}
                            onClick={() => handleRemoveCriterion(idx)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          </Stack>
        </Box>

        {/* Drawer Footer Actions */}
        <Box
          sx={{
            p: 2.5,
            px: 3,
            borderTop: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1.5,
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            disabled={isLoading}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            Hủy bỏ
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
          >
            {isLoading ? 'Đang lưu...' : isEditing ? 'Cập nhật kịch bản' : 'Tạo kịch bản ngay'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default InterviewScriptDrawer;
