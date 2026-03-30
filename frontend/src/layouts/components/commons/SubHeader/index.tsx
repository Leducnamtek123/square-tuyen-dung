import * as React from 'react';
import { useAppSelector } from '@/redux/hooks';

import { useDispatch } from 'react-redux';

import { useRouter } from 'next/navigation';

import { Container, Stack, useMediaQuery } from "@mui/material";

import AppBar from '@mui/material/AppBar';

import Box from '@mui/material/Box';

import Toolbar from '@mui/material/Toolbar';

import Typography from '@mui/material/Typography';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faListUl } from '@fortawesome/free-solid-svg-icons';

import SubHeaderDialog from '../SubHeaderDialog';

import commonService from '../../../../services/commonService';

import { useTheme } from '@mui/material/styles';

import { searchJobPost } from '../../../../redux/filterSlice';

import { ROUTES } from '../../../../configs/constants';

interface CareerItem {
  id: string;
  name: string;
}



const listItems = (items: CareerItem[], handleFilter: (id: string) => void) => (

  <Stack

    direction="row"

    spacing={2}

    alignContent="center"

    sx={{
      overflowX: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      '&::-webkit-scrollbar': {
        display: 'none',
      },

      '& .MuiTypography-root:hover': {

        transform: 'translateY(-2px)',

        transition: 'transform 0.2s ease-in-out'

      }

    }}

  >

    {items.map((item) => (

      <Typography

        variant="body2"

        key={item.id}

        sx={{

          fontWeight: 600,

          cursor: 'pointer',

          whiteSpace: 'nowrap',

          padding: '6px 12px',

          borderRadius: '16px',

          transition: 'all 0.2s ease-in-out',

          '&:hover': {

            backgroundColor: (theme) => theme.palette.primary.background,

            color: (theme) => theme.palette.primary.main,

          }

        }}

        onClick={() => handleFilter(item.id)}

      >

        {item?.name}

      </Typography>

    ))}

  </Stack>

);

const SubHeader = () => {

  const dispatch = useDispatch();

  const nav = useRouter();

  const { jobPostFilter } = useAppSelector((state) => state.filter);

  const [open, setOpen] = React.useState(false);

  const [topCareers, setTopCareers] = React.useState<CareerItem[]>([]);

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));

  React.useEffect(() => {

    const getTopCarreers = async () => {

      try {

        const resData = await commonService.getTop10Careers();

        setTopCareers(resData.map((item: any) => ({
          ...item,
          id: String(item.id)
        })));

      } catch (error) {

      } finally {

      }

    };

    getTopCarreers();

  }, []);

  const handleFilter = (id: string) => {

    dispatch(searchJobPost({ ...jobPostFilter, careerId: id }));

    nav.push(`/${ROUTES.JOB_SEEKER.JOBS}`);

  };

  return (

    <>

      {/* SubHeader ẩn trên xs vì HomeSearch đã nằm dưới TopSlide; hiện từ sm+ */}
      <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>

        <AppBar

          position="static"

          sx={{

            bgcolor: (theme) =>

              theme.palette.mode === 'light' ? 'white' : 'black',

            boxShadow: 0,

            borderBottom: 1,

            borderColor: (theme) =>

              theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.primary.dark,

          }}

        >

          <Container maxWidth="xl">

            <Toolbar

              variant="dense"

              sx={{

                color: (theme) =>

                  theme.palette.mode === 'light' ? 'black' : 'white',

                py: 0.5,

                gap: 1

              }}

            >

              <Box

                sx={{

                  cursor: 'pointer',

                  width: 40,

                  height: 40,

                  display: 'flex',

                  alignItems: 'center',

                  justifyContent: 'center',

                  borderRadius: '12px',

                  transition: 'all 0.2s ease-in-out',

                  '&:hover': {

                    backgroundColor: theme.palette.primary.background,

                    transform: 'scale(1.05)'

                  }

                }}

                onClick={() => setOpen(true)}

              >

                <FontAwesomeIcon

                  icon={faListUl}

                  fontSize={20}

                  style={{

                    color: theme.palette.primary.main

                  }}

                />

              </Box>

              {!isSmall && listItems(topCareers, handleFilter)}

            </Toolbar>

          </Container>

        </AppBar>

      </Box>

      {/* Start: Subheader Dialog */}

      <SubHeaderDialog

        open={open}

        setOpen={setOpen}

        topCareers={topCareers}

        handleFilter={handleFilter}

      />

      {/* End: Subheader Dialog */}

    </>

  );

};

export default SubHeader;
