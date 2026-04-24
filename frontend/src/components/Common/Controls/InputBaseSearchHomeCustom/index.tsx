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
import { useDebounce } from '@/hooks';
import { searchJobPostWithKeyword } from '@/redux/filterSlice';
import jobService from '@/services/jobService';
import { ROUTES } from '@/configs/constants';
import { useTranslation } from 'react-i18next';

interface Props<T extends FieldValues = FieldValues> {
  name: string;
  control: Control<T>;
  placeholder?: string;
  showSubmitButton?: boolean;
  location?: 'HOME' | string;
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

const InputBaseSearchHomeCustom = <T extends FieldValues = FieldValues>({
  name,
  control,
  placeholder,
  showSubmitButton = false,
  location = 'HOME',
}: Props<T>) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const inputSearchRef = React.useRef<HTMLDivElement | null>(null);
  const nav = useRouter();
  const dispatch = useDispatch();
  const [state, dispatchSearch] = React.useReducer(reducer, initialState);
  const debounced = useDebounce(state.searchValue, 300);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('recentSearch');
      if (!stored) return;
      const parsed = JSON.parse(stored) as unknown;
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
      localStorage.setItem('recentSearch', JSON.stringify(nextRecent));
    } catch {
      // ignore storage errors
    }

    if (location === 'HOME') {
      nav.push(`/${ROUTES.JOB_SEEKER.JOBS}`);
    }
  };

  return (
    <ClickAwayListener onClickAway={handleHideResult}>
      <div ref={inputSearchRef}>
        <Box
          sx={{
            boxShadow: 0,
            borderRadius: 1,
            p: '3.5px 4px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            backgroundColor: theme.palette.mode === 'light' ? 'white' : '#121212',
          }}
        >
          <SearchIcon color="disabled" />
          <Controller
            name={name as Path<T>}
            control={control}
            render={({ field }) => (
              <InputBase
                inputRef={inputRef}
                id={field.name}
                sx={{ ml: 1, flex: 1 }}
                placeholder={placeholder}
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
            <Button variant="contained" type="submit" color="primary">
              {t('search.button')}
            </Button>
          )}
        </Box>

        <Popper
          open={state.showResult}
          anchorEl={inputSearchRef.current}
          placement="bottom-start"
          style={{ zIndex: 20, width: inputSearchRef.current?.offsetWidth }}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              py: 2,
              px: 2,
              boxShadow: 4,
              borderRadius: 1,
              maxHeight: '60vh',
              overflowY: 'auto',
            }}
          >
            <Stack>
              <Box>
                <Typography fontWeight="bold" fontSize={17} color="#2C95FF">
                  {t('search.suggestions')}
                </Typography>
                <Stack>
                  {state.isLoading ? (
                    <Stack sx={{ py: 2 }} justifyContent="center" alignItems="center">
                      <CircularProgress size={20} />
                    </Stack>
                  ) : state.searchResult.length === 0 ? (
                    <Typography my={1} textAlign="center" color="#bdbdbd" variant="caption">
                      {t('search.noResults')}
                    </Typography>
                  ) : (
                    <List>
                      {state.searchResult.map((value) => (
                        <ListItem
                          key={value}
                          sx={{
                            '&:hover': {
                              backgroundColor: '#E9F4FF',
                            },
                            cursor: 'pointer',
                            borderRadius: 1,
                            px: 0.5,
                          }}
                          onClick={() => handleClickItem(value)}
                        >
                          <ListItemIcon sx={{ minWidth: 0, mr: 1 }}>
                            <LightbulbOutlinedIcon sx={{ color: '#FCC67B' }} />
                          </ListItemIcon>
                          <ListItemText primary={`${value}`} secondary={null} />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Stack>
              </Box>

              {state.recentSearch.length > 0 && (
                <Box>
                  <Typography fontWeight="bold" fontSize={17} color="#2C95FF">
                    {t('search.recent')}
                  </Typography>
                  <Stack>
                    <List>
                      {state.recentSearch.map((value) => (
                        <ListItem
                          key={value}
                          sx={{
                            '&:hover': {
                              backgroundColor: '#E9F4FF',
                            },
                            cursor: 'pointer',
                            borderRadius: 1,
                            px: 0.5,
                          }}
                          onClick={() => handleClickItem(value)}
                        >
                          <ListItemIcon sx={{ minWidth: 0, mr: 1 }}>
                            <QueryBuilderIcon sx={{ color: '#2C95FF' }} />
                          </ListItemIcon>
                          <ListItemText primary={`${value}`} secondary={null} />
                        </ListItem>
                      ))}
                    </List>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>
        </Popper>
      </div>
    </ClickAwayListener>
  );
};

export default InputBaseSearchHomeCustom;
