'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import GridViewIcon from '@mui/icons-material/GridView';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import { ROUTES } from '@/configs/constants';
import { getPortalPrefix, getPreferredLanguage } from '@/configs/portalRouting';
import { localizeRoutePath } from '@/configs/routeLocalization';

interface NavCommand {
  id: string;
  title: string;
  category: string;
  route: string;
  icon: React.ElementType;
  keywords: string[];
}

const COMMAND_ITEMS: NavCommand[] = [
  { id: 'dashboard', title: 'Tổng quan hệ thống (Dashboard)', category: 'Tổng quan', route: ROUTES.ADMIN.DASHBOARD, icon: GridViewIcon, keywords: ['dashboard', 'tong quan', 'thong ke', 'analytics', 'kpi'] },
  { id: 'agent-assistants', title: 'Trợ lý AI (Agent Assistants)', category: 'AI & Tự động hóa', route: ROUTES.ADMIN.AGENT_ASSISTANTS, icon: SmartToyOutlinedIcon, keywords: ['ai', 'agent', 'tro ly', 'assistant'] },
  { id: 'users', title: 'Người dùng & Phân quyền', category: 'Hệ thống', route: ROUTES.ADMIN.USERS, icon: AccountCircleOutlinedIcon, keywords: ['users', 'nguoi dung', 'tai khoan', 'phan quyen', 'roles'] },
  { id: 'settings', title: 'Cấu hình hệ thống', category: 'Hệ thống', route: ROUTES.ADMIN.SETTINGS, icon: SettingsOutlinedIcon, keywords: ['settings', 'cau hinh', 'he thong', 'config'] },
  { id: 'audit-logs', title: 'Nhật ký kiểm toán (Audit Logs)', category: 'Hệ thống', route: ROUTES.ADMIN.AUDIT_LOGS, icon: HistoryOutlinedIcon, keywords: ['audit', 'logs', 'nhat ky', 'kiem toan', 'lich su'] },
  { id: 'hrm-dashboard', title: 'HRM - Tổng quan nhân sự', category: 'HRM', route: ROUTES.ADMIN.HRM_DASHBOARD, icon: BadgeOutlinedIcon, keywords: ['hrm', 'nhan su', 'hr dashboard'] },
  { id: 'hrm-employees', title: 'HRM - Danh sách nhân viên', category: 'HRM', route: ROUTES.ADMIN.HRM_EMPLOYEES, icon: PeopleOutlinedIcon, keywords: ['nhan vien', 'employees', 'hrm'] },
  { id: 'hrm-org-chart', title: 'HRM - Sơ đồ tổ chức (Org Chart)', category: 'HRM', route: ROUTES.ADMIN.HRM_ORG_CHART, icon: AccountTreeOutlinedIcon, keywords: ['org chart', 'so do to chuc', 'phong ban'] },
  { id: 'jobs', title: 'Quản lý tin tuyển dụng', category: 'Tuyển dụng', route: ROUTES.ADMIN.JOBS, icon: WorkOutlineOutlinedIcon, keywords: ['jobs', 'viec lam', 'tin tuyen dung', 'duyet tin'] },
  { id: 'trust-reports', title: 'Báo cáo gian lận & Độ tin cậy', category: 'Tuyển dụng', route: ROUTES.ADMIN.TRUST_REPORTS, icon: ReportProblemOutlinedIcon, keywords: ['trust', 'reports', 'to cao', 'gian lan', 'bao cao'] },
  { id: 'companies', title: 'Quản lý doanh nghiệp', category: 'Hồ sơ', route: ROUTES.ADMIN.COMPANIES, icon: BusinessOutlinedIcon, keywords: ['companies', 'doanh nghiep', 'cong ty'] },
  { id: 'company-verifications', title: 'Xác thực doanh nghiệp (KYC)', category: 'Hồ sơ', route: ROUTES.ADMIN.COMPANY_VERIFICATIONS, icon: VerifiedUserOutlinedIcon, keywords: ['xac thuc', 'verification', 'kyc', 'giay phep'] },
  { id: 'articles', title: 'Quản lý bài viết & Tin tức', category: 'Nội dung', route: ROUTES.ADMIN.ARTICLES, icon: ArticleOutlinedIcon, keywords: ['articles', 'bai viet', 'tin tuc', 'blog'] },
  { id: 'banners', title: 'Quản lý Banner quảng cáo', category: 'Nội dung', route: ROUTES.ADMIN.BANNERS, icon: ViewCarouselOutlinedIcon, keywords: ['banners', 'quang cao', 'banner'] },
  { id: 'cities', title: 'Danh mục Tỉnh / Thành phố', category: 'Danh mục', route: ROUTES.ADMIN.CITIES, icon: LocationCityOutlinedIcon, keywords: ['cities', 'tinh thanh', 'thanh pho', 'dia diem'] },
  { id: 'careers', title: 'Danh mục Ngành nghề', category: 'Danh mục', route: ROUTES.ADMIN.CAREERS, icon: WorkOutlineOutlinedIcon, keywords: ['careers', 'nganh nghe', 'linh vuc'] },
  { id: 'questions', title: 'Ngân hàng câu hỏi phỏng vấn', category: 'Phỏng vấn AI', route: ROUTES.ADMIN.QUESTIONS, icon: QuizOutlinedIcon, keywords: ['questions', 'cau hoi', 'phong van', 'de thi'] },
  { id: 'voice-profiles', title: 'Cấu hình giọng đọc AI (Voice Profiles)', category: 'Phỏng vấn AI', route: ROUTES.ADMIN.VOICE_PROFILES, icon: RecordVoiceOverOutlinedIcon, keywords: ['voice', 'giong doc', 'tts', 'audio'] },
];

export interface AdminCommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminCommandPalette({ open, onClose }: AdminCommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const lang = getPreferredLanguage();

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return COMMAND_ITEMS;
    const lowerQuery = query.toLowerCase().trim();
    return COMMAND_ITEMS.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(lowerQuery);
      const matchCategory = item.category.toLowerCase().includes(lowerQuery);
      const matchKeywords = item.keywords.some((kw) => kw.includes(lowerQuery));
      return matchTitle || matchCategory || matchKeywords;
    });
  }, [query]);

  const handleSelectCommand = (command: NavCommand) => {
    onClose();
    const localizedPath = localizeRoutePath(`/${command.route}`, lang);
    router.push(localizedPath);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      e.preventDefault();
      handleSelectCommand(filteredCommands[selectedIndex]);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: '#FFFFFF',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          top: '-15%',
        },
      }}
    >
      <Box sx={{ p: 2, pb: 1.5, display: 'flex', alignItems: 'center', borderBottom: '1px solid #E2E8F0' }}>
        <SearchIcon sx={{ color: '#64748B', mr: 1.5, fontSize: 24 }} />
        <TextField
          autoFocus
          fullWidth
          variant="standard"
          placeholder="Tìm trang, chức năng, hoặc lệnh quản trị... (Ctrl+K)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          InputProps={{
            disableUnderline: true,
            sx: { fontSize: '1rem', color: '#1E293B' },
          }}
        />
        <IconButton size="small" onClick={onClose} sx={{ color: '#94A3B8' }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 1, maxHeight: 380, overflowY: 'auto' }}>
        {filteredCommands.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
              Không tìm thấy lệnh hoặc trang nào phù hợp với "{query}"
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {filteredCommands.map((command, index) => {
              const IconComp = command.icon;
              const isSelected = index === selectedIndex;

              return (
                <ListItem key={command.id} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => handleSelectCommand(command)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    sx={{
                      borderRadius: 2,
                      py: 1,
                      px: 1.5,
                      '&.Mui-selected': {
                        bgcolor: '#EFF6FF',
                        '&:hover': { bgcolor: '#DBEAFE' },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <IconComp sx={{ fontSize: 20, color: isSelected ? '#2563EB' : '#64748B' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 600, color: isSelected ? '#1E40AF' : '#1E293B' }}>
                          {command.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          {command.category} • /{command.route}
                        </Typography>
                      }
                    />
                    <Chip
                      label={command.category}
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        height: 20,
                        bgcolor: isSelected ? '#BFDBFE' : '#F1F5F9',
                        color: isSelected ? '#1E40AF' : '#475569',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>

      <Box
        sx={{
          p: 1.5,
          px: 2,
          bgcolor: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
          Dùng phím <kbd style={{ padding: '2px 4px', background: '#E2E8F0', borderRadius: 4 }}>↑</kbd> <kbd style={{ padding: '2px 4px', background: '#E2E8F0', borderRadius: 4 }}>↓</kbd> để di chuyển, <kbd style={{ padding: '2px 4px', background: '#E2E8F0', borderRadius: 4 }}>Enter</kbd> để chọn
        </Typography>
        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
          <kbd style={{ padding: '2px 4px', background: '#E2E8F0', borderRadius: 4 }}>ESC</kbd> để đóng
        </Typography>
      </Box>
    </Dialog>
  );
}
