import React from 'react';

import { Link } from 'react-router-dom';

import { Box, Stack, Button, Pagination } from "@mui/material";

import FavoriteIcon from '@mui/icons-material/Favorite';

import {ROUTES} from '../../../../configs/constants';

import NoDataCard from '../../../../components/NoDataCard';

import JobPostAction from '../../../../components/JobPostAction';

import jobService from '../../../../services/jobService';

import errorHandling from '../../../../utils/errorHandling';

import toastMessages from '../../../../utils/toastMessages';

import { useTranslation } from 'react-i18next';

interface JobPost {
  id: string;
  slug: string;
  companyDict?: {
    companyImageUrl?: string;
    companyName?: string;
  };
  jobName: string;
  locationDict?: {
    city?: string;
  };
  deadline: string;
  isUrgent: boolean;
  isHot: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
}



const pageSize = 10;



const SavedJobCard = () => {

  const { t } = useTranslation(['jobSeeker', 'common']);



  const [isSuccess, setIsSuccess] = React.useState(false);



  const [isLoading, setIsLoading] = React.useState(true);



  const [jobPosts, setJobPosts] = React.useState<JobPost[]>([]);



  const [page, setPage] = React.useState(1);



  const [count, setCount] = React.useState(0);



  React.useEffect(() => {



    const getJobPosts = async (params?: any) => {



      setIsLoading(true);



      try {



        const resData = await jobService.getJobPostsSaved({



          pageSize: pageSize,



          page: page,



        }) as any;



        const data = resData.data;



        setCount(data.count);



        setJobPosts(data.results);



      } catch (error: any) {

        console.log(error);

      } finally {



        setIsLoading(false);



      }



    };



    getJobPosts();



      }, [page, isSuccess]);



  const handleChangePage = (event: any, newPage: number) => {



    setPage(newPage);



  };



  const handleSave = (slug: string) => {



    const saveJobPost = async (slug: string) => {



      try {



        const resData = await jobService.saveJobPost(slug) as any;



        const isSaved = resData.data.isSaved;



        toastMessages.success(



          isSaved ? t('jobSeeker:jobManagement.messages.saved') : t('jobSeeker:jobManagement.messages.unsaved')



        );



        setIsSuccess(!isSuccess);



      } catch (error: any) {



        errorHandling(error);



      }



    };



    saveJobPost(slug);



  };



  return (



    <>



      <Box>



        {isLoading ? (



          <Stack spacing={2}>



            {Array.from(Array(5).keys()).map((value) => (



              <JobPostAction.Loading key={value} />



            ))}



          </Stack>



        ) : jobPosts.length === 0 ? (



          <NoDataCard



            title={t('jobSeeker:jobManagement.empty.saved')}



            svgKey="ImageSvg5"



          >



            <Button



              component={Link}



              to={`/${ROUTES.JOB_SEEKER.JOBS}`}



              variant="contained"



              color="primary"



              sx={{ textTransform: 'inherit' }}



            >



              {t('jobSeeker:jobManagement.actions.searchJobs')}



            </Button>



          </NoDataCard>



        ) : (



          <Stack spacing={2}>



            {jobPosts.map((value) => (



              <JobPostAction



                key={value.id}



                id={value.id}



                slug={value.slug}



                companyImageUrl={value?.companyDict?.companyImageUrl}



                companyName={value?.companyDict?.companyName || ''}



                jobName={value?.jobName}



                cityId={value?.locationDict?.city}



                deadline={value?.deadline}



                isUrgent={value?.isUrgent}



                isHot={value?.isHot}



                salaryMin={value.salaryMin ?? undefined}



                salaryMax={value.salaryMax ?? undefined}



              >



                <Button



                  size="small"



                  variant="outlined"



                  color="error"



                  sx={{ textTransform: 'inherit' }}



                  startIcon={<FavoriteIcon />}



                  onClick={() => handleSave(value.slug)}



                >



                  {t('jobSeeker:jobManagement.actions.unsave')}



                </Button>



              </JobPostAction>



            ))}



            <Stack sx={{ pt: 2 }} alignItems="center">



              {Math.ceil(count / pageSize) > 1 && (



                <Pagination



                  color="primary"



                  size="medium"



                  variant="text"



                  sx={{ margin: '0 auto' }}



                  count={Math.ceil(count / pageSize)}



                  page={page}



                  onChange={handleChangePage}



                />



              )}



            </Stack>



          </Stack>



        )}



      </Box>



    </>



  );



};



export default SavedJobCard;
