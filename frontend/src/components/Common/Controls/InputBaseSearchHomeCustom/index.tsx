'use client';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Box, ClickAwayListener, List, ListItem, ListItemIcon, ListItemText, Popper, Stack, Typography, CircularProgress, IconButton, InputAdornment } from '@mui/material';
const PopperAny = Popper as unknown as React.ComponentType<any>;
import { useDebounce } from '@/hooks';
import { searchJobPostWithKeyword } from '@/redux/filterSlice';
import jobService from '@/services/jobService';
import { ROUTES } from '@/configs/constants';
import { useTranslation } from 'react-i18next';
import {
  RECENT_SEARCH_STORAGE_KEY,
  LEGACY_RECENT_SEARCH_STORAGE_KEY,
  readVersionedJson,
  writeVersionedJson,
} from '@/utils/storageKeys';
import { localizeRoutePath } from '@/configs/routeLocalization';
const ControllerAny = Controller as any;

interface Props<T extends FieldValues = FieldValues> {
  name: string;
  control: Control<T>;
  placeholder?: string;
  showSubmitButton?: boolean;
  location?: 'HOME' | string;
  variant?: 'default' | 'hero';
}

type SearchState = {
  showResult: boolean;
  searchValue: string;
  searchResult: string[];
  recentSearch: string[];
  isLoading: boolean;
};

type SearchAction =
  | { type: 'show_result'; value: boolean }
  | { type: 'set_search_value'; value: string }
  | { type: 'set_search_result'; value: string[] }
  | { type: 'set_recent_search'; value: string[] }
  | { type: 'set_loading'; value: boolean };

const initialState: SearchState = {
  showResult: false,
  searchValue: '',
  searchResult: [],
  recentSearch: [],
  isLoading: false,
};

function reducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'show_result':
      return { ...state, showResult: action.value };
    case 'set_search_value':
      return { ...state, searchValue: action.value };
    case 'set_search_result':
      return { ...state, searchResult: action.value };
    case 'set_recent_search':
      return { ...state, recentSearch: action.value };
    case 'set_loading':
      return { ...state, isLoading: action.value };
    default:
      return state;
  }
}

import { useQuery } from '@tanstack/react-query';
import commonService from '@/services/commonService';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const DEFAULT_HERO_PLACEHOLDERS = [
  'Tìm kiếm: Kỹ sư phần mềm, React, Java...',
  'Tìm kiếm: Trưởng phòng nhân sự, HR Manager...',
  'Tìm kiếm: UI/UX Designer, Figma, Design System...',
  'Tìm kiếm: Kế toán tổng hợp, Financial Analyst...',
  'Tìm kiếm: Giám đốc kinh doanh, Sales B2B...',
];

function useHeroTypewriter(phrases: string[], enabled: boolean) {
  const [currentText, setCurrentText] = React.useState(phrases[0] || '');
  const [phraseIndex, setPhraseIndex] = React.useState(0);
  const [charIndex, setCharIndex] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    if (!enabled || phrases.length === 0) return;

    const currentPhrase = phrases[phraseIndex % phrases.length];
    const typingSpeed = isDeleting ? 30 : 65;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentPhrase.length) {
          setCurrentText(currentPhrase.substring(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);
        } else {
          // Pause at full text
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (charIndex > 0) {
          setCurrentText(currentPhrase.substring(0, charIndex - 1));
          setCharIndex((prev) => prev - 1);
        } else {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex, phrases, enabled]);

  return enabled ? currentText : '';
}

const InputBaseSearchHomeCustom = <T extends FieldValues = FieldValues>({
  name,
  control,
  placeholder,
  showSubmitButton = false,
  location = 'HOME',
  variant = 'default',
}: Props<T>) => {
  const theme = useTheme();
  const isHero = variant === 'hero';
  const animatedHeroPlaceholder = useHeroTypewriter(DEFAULT_HERO_PLACEHOLDERS, isHero);
  const { t, i18n } = useTranslation('common');
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const inputSearchRef = React.useRef<HTMLDivElement | null>(null);
  const { push } = useRouter();
  const dispatch = useDispatch();
  const [state, dispatchSearch] = React.useReducer(reducer, initialState);
  const debounced = useDebounce(state.searchValue, 300);
  const jobsHref = localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, i18n.language);

  const { data: popularKeywords = [] } = useQuery({
    queryKey: ['popular-keywords-popup'],
    queryFn: async () => {
      const res = await commonService.getPopularKeywords();
      return res || [];
    },
    staleTime: 5 * 60_000,
  });

  const { data: topCareers = [] } = useQuery({
    queryKey: ['top-careers-popup'],
    queryFn: async () => {
      const res = await commonService.getTop10Careers();
      return res || [];
    },
    staleTime: 5 * 60_000,
  });

  React.useEffect(() => {
    try {
      const parsed = readVersionedJson<unknown[]>(
        RECENT_SEARCH_STORAGE_KEY,
        [LEGACY_RECENT_SEARCH_STORAGE_KEY]
      );
      if (!parsed) return;
      dispatchSearch({
        type: 'set_recent_search',
        value: Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [],
      });
    } catch {
      dispatchSearch({ type: 'set_recent_search', value: [] });
    }
  }, []);

  React.useEffect(() => {
    if (!debounced) {
      dispatchSearch({ type: 'set_loading', value: false });
      return;
    }

    let active = true;
    dispatchSearch({ type: 'set_loading', value: true });

    const loadSuggestions = async () => {
      try {
        const resData = await jobService.searchJobSuggestTitle(debounced);
        const data = Array.isArray(resData)
          ? resData
          : ((resData as { results?: string[] })?.results || (resData as { data?: string[] })?.data || []);
        if (active) {
          dispatchSearch({ type: 'set_search_result', value: data.flat() });
        }
      } catch (error) {
        console.error('Search failed: ', error);
      } finally {
        if (active) {
          dispatchSearch({ type: 'set_loading', value: false });
        }
      }
    };

    loadSuggestions();

    return () => {
      active = false;
    };
  }, [debounced]);

  const handleHideResult = () => {
    dispatchSearch({ type: 'show_result', value: false });
  };

  const handleClickItem = (kw: string) => {
    dispatch(searchJobPostWithKeyword({ kw }));
    const nextRecent = [kw, ...state.recentSearch.filter((item) => item !== kw)].slice(0, 6);
    dispatchSearch({ type: 'set_recent_search', value: nextRecent });
    dispatchSearch({ type: 'show_result', value: false });
    try {
      writeVersionedJson(RECENT_SEARCH_STORAGE_KEY, nextRecent);
    } catch {
      // ignore storage errors
    }

    if (location === 'HOME') {
      push(jobsHref);
    }
  };

  return (
    <ClickAwayListener onClickAway={handleHideResult}>
      <div ref={inputSearchRef}>
        <Box
          sx={{
            minHeight: isHero ? 56 : showSubmitButton ? 54 : 48,
            boxShadow: isHero ? 'none' : '0 10px 26px rgba(15, 23, 42, 0.08)',
            borderRadius: isHero ? 1 : 999,
            p: isHero ? 0 : '4px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            backgroundColor: isHero ? 'transparent' : theme.palette.mode === 'light' ? 'white' : '#121212',
            border: '1px solid',
            borderColor: isHero ? 'transparent' : 'rgba(226, 232, 240, 0.95)',
            transition: 'border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
            '&:focus-within': {
              borderColor: isHero ? 'transparent' : '#0f172a',
              boxShadow: isHero ? 'none' : '0 0 0 4px rgba(15, 23, 42, 0.08), 0 16px 34px rgba(15, 23, 42, 0.08)',
            },
          }}
        >
          <Box
            sx={{
              width: isHero ? 44 : 38,
              height: isHero ? 56 : 38,
              display: 'grid',
              placeItems: 'center',
              borderRadius: isHero ? 1 : '50%',
              color: '#0f172a',
              bgcolor: isHero ? 'transparent' : 'rgba(15, 23, 42, 0.06)',
              flexShrink: 0,
            }}
          >
            <SearchIcon fontSize="small" />
          </Box>
          <ControllerAny
            name={name as Path<T>}
            control={control}
            render={({ field }: any) => (
              <InputBase
                inputRef={inputRef}
                id={field.name}
                sx={{
                  ml: isHero ? 0 : 1.25,
                  flex: 1,
                  minWidth: 0,
                  '& .MuiInputBase-input': {
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: isHero ? 14 : undefined,
                    py: isHero ? 1.4 : undefined,
                    '&::placeholder': {
                      color: isHero ? 'rgba(15, 23, 42, 0.55)' : 'text.secondary',
                      opacity: isHero ? 1 : 0.78,
                    },
                  },
                }}
                placeholder={isHero && animatedHeroPlaceholder ? animatedHeroPlaceholder : placeholder}
                slotProps={{ input: { 'aria-label': 'search' } }}
                value={field.value ?? ''}
                onFocus={() => dispatchSearch({ type: 'show_result', value: true })}
                onChange={(e) => {
                  const textValue = e.target.value;
                  field.onChange(textValue);
                  dispatchSearch({ type: 'set_search_result', value: [] });
                  dispatchSearch({ type: 'set_search_value', value: textValue });
                  dispatchSearch({ type: 'set_loading', value: true });
                }}
                onBlur={field.onBlur}
                endAdornment={
                  <InputAdornment
                    position="end"
                    sx={{
                      visibility: field.value !== '' && field.value !== null ? 'visible' : 'hidden',
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => {
                        field.onChange('');
                        dispatchSearch({ type: 'set_search_value', value: '' });
                        inputRef.current?.focus();
                      }}
                    >
                      <ClearIcon fontSize="inherit" />
                    </IconButton>
                  </InputAdornment>
                }
              />
            )}
          />
          {showSubmitButton && (
            <Button
              variant="contained"
              type="submit"
              color="primary"
              startIcon={<SearchIcon />}
              sx={{
                flexShrink: 0,
                minHeight: 44,
                minWidth: { xs: 44, sm: 112 },
                px: { xs: 1.5, sm: 2.5 },
                bgcolor: '#0f172a',
                '&:hover': {
                  bgcolor: '#111827',
                },
                '& .MuiButton-startIcon': {
                  display: { xs: 'none', sm: 'inherit' },
                },
              }}
            >
              {t('search.button')}
            </Button>
          )}
        </Box>

        <PopperAny
          open={state.showResult}
          anchorEl={inputSearchRef.current}
          placement="bottom-start"
          style={{ zIndex: 20, width: inputSearchRef.current?.offsetWidth || 360 }}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              py: 2,
              px: 2,
              boxShadow: '0 22px 50px rgba(15, 23, 42, 0.16)',
              border: '1px solid rgba(226, 232, 240, 0.95)',
              borderRadius: 3,
              maxHeight: '60vh',
              overflowY: 'auto',
            }}
          >
            <Stack spacing={2}>
              {/* ── Active Search Results when typing ─────────────────── */}
              {state.searchValue.trim() !== '' ? (
                <Box>
                  <Typography fontWeight={800} fontSize={14} color="#0f172a" sx={{ mb: 1 }}>
                    {t('search.suggestions', { defaultValue: 'Gợi ý tìm kiếm' })}
                  </Typography>
                  {state.isLoading ? (
                    <Stack sx={{ py: 2 }} justifyContent="center" alignItems="center">
                      <CircularProgress size={20} />
                    </Stack>
                  ) : state.searchResult.length === 0 ? (
                    <Typography my={1.5} textAlign="center" color="#94a3b8" variant="body2">
                      Không tìm thấy gợi ý phù hợp
                    </Typography>
                  ) : (
                    <List disablePadding>
                      {state.searchResult.map((value) => (
                        <ListItem
                          key={value}
                          sx={{
                            '&:hover': { backgroundColor: 'rgba(15, 23, 42, 0.04)' },
                            cursor: 'pointer',
                            borderRadius: 2,
                            px: 1.5,
                            py: 1,
                          }}
                          onClick={() => handleClickItem(value)}
                        >
                          <ListItemIcon sx={{ minWidth: 0, mr: 1.5 }}>
                            <LightbulbOutlinedIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
                          </ListItemIcon>
                          <ListItemText primary={value} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              ) : (
                /* ── Default Popup when Input is Empty ──────────────────── */
                <>
                  {/* 1. Từ khóa phổ biến */}
                  {popularKeywords.length > 0 && (
                    <Box>
                      <Typography fontWeight={800} fontSize={13} color="#0f172a" sx={{ mb: 1, letterSpacing: '-0.01em' }}>
                        Từ khóa phổ biến
                      </Typography>
                      <List disablePadding>
                        {popularKeywords.slice(0, 5).map((item) => (
                          <ListItem
                            key={item.id}
                            sx={{
                              '&:hover': { backgroundColor: 'rgba(225, 29, 72, 0.06)' },
                              cursor: 'pointer',
                              borderRadius: 2,
                              px: 1.25,
                              py: 0.75,
                            }}
                            onClick={() => handleClickItem(item.kw || item.title)}
                          >
                            <ListItemIcon sx={{ minWidth: 0, mr: 1.5 }}>
                              <TrendingUpIcon sx={{ color: '#e11d48', fontSize: 18 }} />
                            </ListItemIcon>
                            <ListItemText primary={item.title} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* 2. Ngành nghề nổi bật */}
                  {topCareers.length > 0 && (
                    <Box>
                      <Typography fontWeight={800} fontSize={13} color="#0f172a" sx={{ mb: 1, letterSpacing: '-0.01em' }}>
                        Ngành nghề nổi bật
                      </Typography>
                      <List disablePadding>
                        {topCareers.slice(0, 5).map((career) => (
                          <ListItem
                            key={career.id}
                            sx={{
                              '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.06)' },
                              cursor: 'pointer',
                              borderRadius: 2,
                              px: 1.25,
                              py: 0.75,
                            }}
                            onClick={() => handleClickItem(career.name)}
                          >
                            <ListItemIcon sx={{ minWidth: 0, mr: 1.5 }}>
                              <WorkOutlineIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                            </ListItemIcon>
                            <ListItemText primary={career.name} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* 3. Lịch sử tìm kiếm gần đây */}
                  {state.recentSearch.length > 0 && (
                    <Box>
                      <Typography fontWeight={800} fontSize={13} color="#0f172a" sx={{ mb: 1, letterSpacing: '-0.01em' }}>
                        {t('search.recent', { defaultValue: 'Tìm kiếm gần đây' })}
                      </Typography>
                      <List disablePadding>
                        {state.recentSearch.map((value) => (
                          <ListItem
                            key={value}
                            sx={{
                              '&:hover': { backgroundColor: 'rgba(15, 23, 42, 0.04)' },
                              cursor: 'pointer',
                              borderRadius: 2,
                              px: 1.25,
                              py: 0.75,
                            }}
                            onClick={() => handleClickItem(value)}
                          >
                            <ListItemIcon sx={{ minWidth: 0, mr: 1.5 }}>
                              <QueryBuilderIcon sx={{ color: '#64748b', fontSize: 18 }} />
                            </ListItemIcon>
                            <ListItemText primary={value} primaryTypographyProps={{ fontSize: '0.875rem', color: '#64748b' }} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </>
              )}
            </Stack>
          </Box>
        </PopperAny>
      </div>
    </ClickAwayListener>
  );
};

export default InputBaseSearchHomeCustom;
