'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid2 as Grid,
  TextField,
  Divider,
  Stack,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import InteractiveChipInput from './InteractiveChipInput';
import LiveChatbotPreview from './LiveChatbotPreview';
import type { SystemSettings } from '../hooks/useSystemSettings';

interface ChatbotSettingsTabProps {
  formData: SystemSettings;
  onChange: (name: keyof SystemSettings, value: unknown) => void;
}

const safeParseSuggestions = (raw: string, fallback: string[]): string[] => {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return fallback;
};

export const ChatbotSettingsTab: React.FC<ChatbotSettingsTabProps> = ({ formData, onChange }) => {
  const [activeTab, setActiveTab] = useState<'employer' | 'jobseeker'>('employer');

  const employerSuggestions = safeParseSuggestions(formData.chatbotEmployerSuggestions, [
    'Tìm ứng viên cho vị trí thiết kế',
    'Soạn tin mời phỏng vấn',
    'Mức lương thị trường hiện nay',
  ]);

  const jobSeekerSuggestions = safeParseSuggestions(formData.chatbotJobSeekerSuggestions, [
    'Tìm việc làm vị trí Frontend',
    'Tải mẫu CV tiếng Anh',
    'Cách trả lời phỏng vấn về mức lương',
  ]);

  const handleEmployerSuggestionsChange = (newChips: string[]) => {
    onChange('chatbotEmployerSuggestions', JSON.stringify(newChips));
  };

  const handleJobSeekerSuggestionsChange = (newChips: string[]) => {
    onChange('chatbotJobSeekerSuggestions', JSON.stringify(newChips));
  };

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: 7, xl: 8 }}>
        <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <SmartToyIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Cấu Hình AI Chatbot
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Tùy chỉnh tên Bot, câu chào mở đầu và các câu hỏi gợi ý nhanh hiển thị dạng thẻ (Chips) trên khung chat.
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
              {/* Bot Identity Header Settings */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Tên Chatbot"
                    fullWidth
                    size="small"
                    value={formData.chatbotTitle || ''}
                    onChange={(e) => onChange('chatbotTitle', e.target.value)}
                    placeholder="InfoHR AI"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Phụ đề trạng thái"
                    fullWidth
                    size="small"
                    value={formData.chatbotSubtitle || ''}
                    onChange={(e) => onChange('chatbotSubtitle', e.target.value)}
                    placeholder="Trợ lý tuyển dụng thông minh"
                  />
                </Grid>
              </Grid>

              {/* Sub-tabs for Employer vs Job Seeker */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
                  <Tab
                    icon={<BusinessIcon fontSize="small" />}
                    iconPosition="start"
                    label="Cấu hình cho Nhà Tuyển Dụng"
                    value="employer"
                    sx={{ fontWeight: 700 }}
                  />
                  <Tab
                    icon={<PersonIcon fontSize="small" />}
                    iconPosition="start"
                    label="Cấu hình cho Ứng Viên"
                    value="jobseeker"
                    sx={{ fontWeight: 700 }}
                  />
                </Tabs>
              </Box>

              {/* Tab Content: Employer */}
              {activeTab === 'employer' && (
                <Stack spacing={3}>
                  <Alert severity="info" sx={{ borderRadius: '12px' }}>
                    Thiết lập câu chào và nút gợi ý câu hỏi khi Nhà tuyển dụng mở khung chat AI.
                  </Alert>

                  <TextField
                    label="Nội dung Câu chào (Employer Greeting)"
                    fullWidth
                    multiline
                    rows={5}
                    size="small"
                    value={formData.chatbotEmployerGreeting || ''}
                    onChange={(e) => onChange('chatbotEmployerGreeting', e.target.value)}
                    helperText="Hỗ trợ gạch đầu dòng Markdown (* hoặc -) để danh sách tính năng hiển thị đẹp mắt."
                  />

                  <InteractiveChipInput
                    label="Nút Gợi Ý Câu Hỏi Nhanh (Employer Prompt Chips)"
                    helperText="Các câu hỏi gợi ý nhanh xuất hiện dạng thẻ Pill màu hồng/đỏ dưới câu chào mừng."
                    chips={employerSuggestions}
                    onChange={handleEmployerSuggestionsChange}
                    placeholder="Ví dụ: Tìm ứng viên vị trí ReactJS..."
                  />
                </Stack>
              )}

              {/* Tab Content: Job Seeker */}
              {activeTab === 'jobseeker' && (
                <Stack spacing={3}>
                  <Alert severity="info" sx={{ borderRadius: '12px' }}>
                    Thiết lập câu chào và nút gợi ý câu hỏi khi Ứng viên tìm việc mở khung chat AI.
                  </Alert>

                  <TextField
                    label="Nội dung Câu chào (Job Seeker Greeting)"
                    fullWidth
                    multiline
                    rows={5}
                    size="small"
                    value={formData.chatbotJobSeekerGreeting || ''}
                    onChange={(e) => onChange('chatbotJobSeekerGreeting', e.target.value)}
                    helperText="Hỗ trợ gạch đầu dòng Markdown (* hoặc -) để danh sách mẹo tìm việc hiển thị rõ ràng."
                  />

                  <InteractiveChipInput
                    label="Nút Gợi Ý Câu Hỏi Nhanh (Job Seeker Prompt Chips)"
                    helperText="Các câu hỏi gợi ý nhanh dành cho ứng viên tìm việc làm, tạo CV, tư vấn lương."
                    chips={jobSeekerSuggestions}
                    onChange={handleJobSeekerSuggestionsChange}
                    placeholder="Ví dụ: Tạo CV mẫu Tiếng Anh..."
                  />
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Right Column: Live Chatbot Widget Preview */}
      <Grid size={{ xs: 12, lg: 5, xl: 4 }}>
        <Box sx={{ position: 'sticky', top: 24 }}>
          <LiveChatbotPreview
            title={formData.chatbotTitle}
            subtitle={formData.chatbotSubtitle}
            employerGreeting={formData.chatbotEmployerGreeting}
            jobSeekerGreeting={formData.chatbotJobSeekerGreeting}
            employerSuggestions={employerSuggestions}
            jobSeekerSuggestions={jobSeekerSuggestions}
            activeTarget={activeTab}
            onTargetChange={setActiveTab}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export default ChatbotSettingsTab;
