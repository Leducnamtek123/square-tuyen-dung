import * as React from 'react';

import { useDispatch } from 'react-redux';

import { useRouter } from 'next/navigation';

import { useTheme } from '@mui/material/styles';

import InputBase from '@mui/material/InputBase';

import Button from '@mui/material/Button';

import SearchIcon from '@mui/icons-material/Search';

import ClearIcon from '@mui/icons-material/Clear';

import { Control, Controller } from 'react-hook-form';

import { Box, ClickAwayListener, List, ListItem, ListItemIcon, ListItemText, Popper, Stack, Typography } from "@mui/material";

import { CircularProgress, IconButton, InputAdornment } from "@mui/material";

import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';

import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';

import { useDebounce } from '@/hooks';

import { searchJobPostWithKeyword } from '@/redux/filterSlice';

import jobService from '@/services/jobService';

import { ROUTES } from '@/configs/constants';

interface Props {
  name: string;
  control: Control<any>;
  placeholder?: string;
  showSubmitButton?: boolean;
  location?: 'HOME' | string;
}

const InputBaseSearchHomeCustom = ({
  name,
  control,
  placeholder,
  showSubmitButton = false,
  location = 'HOME',
}: Props) => {
  const theme = useTheme();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const inputSearchRef = React.useRef<HTMLDivElement | null>(null);

  const nav = useRouter();

  const dispatch = useDispatch();

  const [showResult, setShowResult] = React.useState(false);

  const [searchValue, setSearchValue] = React.useState('');

  const [searchResult, setSearchResult] = React.useState([]);

  const [recentSearch, setRecentSearch] = React.useState([]);

  const debounded = useDebounce(searchValue, 300);

  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const getSuggestTitle = async (kw: string) => {
      if (!isLoading) {
        setIsLoading(true);
      }
      try {
        const resData = await jobService.searchJobSuggestTitle(kw);
        const data = Array.isArray(resData) ? resData : (resData?.data || []);
        setSearchResult(data.flat());
      } catch (error) {
        console.error('Search failed: ', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (debounded) {
      getSuggestTitle(debounded);
    }
  }, [debounded, isLoading]);

  const handleHideResult = () => {
    setShowResult(false);
  };

  const handleClickItem = (kw: string) => {
    dispatch(searchJobPostWithKeyword({ kw: kw }));

    switch (location) {
      case 'HOME':
        nav.push(`/${ROUTES.JOB_SEEKER.JOBS}`);
        break;
      default:
        break;
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
            backgroundColor:
              theme.palette.mode === 'light' ? 'white' : '#121212',
          }}
        >
          <SearchIcon color="disabled" />

          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <InputBase
                inputRef={inputRef}
                id={field.name}
                sx={{ ml: 1, flex: 1 }}
                placeholder={placeholder}
                slotProps={{ input: { 'aria-label': 'search' } }}
                value={field.value ?? ''}
                onFocus={() => setShowResult(true)}
                onChange={(e) => {
                  const textValue = e.target.value;
                  field.onChange(textValue);
                  setSearchResult([]);
                  setSearchValue(textValue);
                  if (!isLoading) {
                    setIsLoading(true);
                  }
                }}
                onBlur={field.onBlur}
                endAdornment={
                  <InputAdornment
                    position="end"
                    sx={{
                      visibility:
                        field.value !== '' && field.value !== null
                          ? 'visible'
                          : 'hidden',
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => {
                        field.onChange('');
                        setSearchValue('');
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
              Tìm kiếm
            </Button>
          )}
        </Box>

        <Popper
          open={showResult}
          anchorEl={inputSearchRef.current}
          placement="bottom-start"
          style={{ zIndex: 1300, width: inputSearchRef.current?.offsetWidth }}
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
                  Gợi ý tìm kiếm
                </Typography>

                <Stack>
                  {isLoading ? (
                    <Stack sx={{ py: 2 }} justifyContent="center" alignItems="center">
                      <CircularProgress size={20} />
                    </Stack>
                  ) : searchResult.length === 0 ? (
                    <Typography
                      my={1}
                      textAlign="center"
                      color={'#bdbdbd'}
                      variant="caption"
                    >
                      Không có dữ liệu
                    </Typography>
                  ) : (
                    <List>
                      {searchResult.map((value) => (
                        <ListItem
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
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              mr: 1,
                            }}
                          >
                            <LightbulbOutlinedIcon sx={{ color: '#FCC67B' }} />
                          </ListItemIcon>
                          <ListItemText primary={`${value}`} secondary={null} />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Stack>
              </Box>

              {(recentSearch || [])?.length > 0 && (
                <Box>
                  <Typography fontWeight="bold" fontSize={17} color="#2C95FF">
                    Tìm kiếm gần đây
                  </Typography>

                  <Stack>
                    <List>
                      {recentSearch.map((value, index) => (
                        <ListItem
                          key={index}
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
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              mr: 1,
                            }}
                          >
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



