import React, { Suspense, lazy } from "react";

import { useParams } from 'next/navigation';

import { Box, Divider, Stack, Typography, Fab } from "@mui/material";
import { Theme } from "@mui/material/styles";



import FileUploadIcon from "@mui/icons-material/FileUpload";



import CVForm, { FormValues as CVFormValues } from "../CVForm";



import { useTranslation } from "react-i18next";



const LazyPdf = lazy(() => import("../../../../components/Common/Pdf"));

import BackdropLoading from "../../../../components/Common/Loading/BackdropLoading";



import errorHandling from "../../../../utils/errorHandling";



import FormPopup from "../../../../components/Common/Controls/FormPopup";



import resumeService from "../../../../services/resumeService";



import toastMessages from "../../../../utils/toastMessages";
import type { AxiosError } from 'axios';



interface CVCardProps {
  title: string;
}

interface CVData {
  title: string;
  fileUrl: string;
}



const CVCard = ({ title }: CVCardProps) => {

  const { t } = useTranslation(["jobSeeker", "common"]);



  const { slug: resumeSlug } = useParams<{ slug: string }>();



  const [openPopup, setOpenPopup] = React.useState(false);



  const [isSuccess, setIsSuccess] = React.useState(false);



  const [isLoadingCv, setIsLoadingCv] = React.useState(true);



  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);



  const [cv, setCv] = React.useState<CVData | null>(null);



  React.useEffect(() => {



    const getResumeDetail = async (slug: string | undefined) => {
      if (!slug) return;



      setIsLoadingCv(true);



      try {



        const resData = await resumeService.getCv(slug) as CVData;



        setCv(resData);



      } catch (error: unknown) {



        errorHandling(error as AxiosError<Record<string, unknown>>);



      } finally {



        setIsLoadingCv(false);



      }



    };



    getResumeDetail(resumeSlug);



  }, [resumeSlug, isSuccess]);



  const handleUpdate = (data: CVFormValues) => {



    const updateCV = async (slug: string | undefined, payloadData: CVFormValues) => {
      if (!slug) return;



      setIsFullScreenLoading(true);



      const formData = new FormData();



      if (payloadData.files && payloadData.files.length > 0) {
        formData.append("file", payloadData.files[0] as Blob);
      }



      try {



        await resumeService.updateCV(slug, formData);



        setOpenPopup(false);



        setIsSuccess(!isSuccess);



        toastMessages.success(t("jobSeeker:profile.messages.resumeUploadSuccess"));



      } catch (error: unknown) {



        errorHandling(error as AxiosError<Record<string, unknown>>);



      } finally {



        setIsFullScreenLoading(false);



      }



    };



    updateCV(resumeSlug, data);



  };



  return (



    <>



      <Stack



        sx={{



          backgroundColor: "background.paper",



          borderRadius: 2,



          p: 3,



          boxShadow: (theme: Theme) => theme.customShadows.card,



          "&:hover": {



            boxShadow: (theme: Theme) => theme.customShadows.medium,



          },



        }}



      >



        <Box>



          <Stack



            direction="row"



            justifyContent="space-between"



            alignItems="center"



          >



            <Typography



              variant="h5"



              sx={{



                fontWeight: 600,



              }}



            >



              {title}



            </Typography>



            <Fab



              size="small"



              color="primary"



              aria-label={t("jobSeeker:profile.actions.uploadCv")}



              onClick={() => setOpenPopup(true)}



              sx={{



                boxShadow: (theme: Theme) => theme.customShadows.medium,



                "&:hover": {



                  transform: "scale(1.1)",



                },



                transition: "all 0.2s ease-in-out",



              }}



            >



              <FileUploadIcon />



            </Fab>



          </Stack>



        </Box>



        <Divider sx={{ my: 3, borderColor: 'grey.500' }} />



        <Box>



          {isLoadingCv ? (



            <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>



              <Typography variant="subtitle1" color="text.secondary">



                {t("jobSeeker:profile.cv.loading")}



              </Typography>



            </Stack>



          ) : cv === null ? (



            <Stack



              alignItems="center"



              justifyContent="center"



              sx={{



                py: 8,



                backgroundColor: "primary.background",



                borderRadius: 2,



              }}



            >



              <Typography



                variant="subtitle1"



                color="text.secondary"



                sx={{ mb: 1 }}



              >



                {t("jobSeeker:profile.cv.emptyTitle")}



              </Typography>



              <Typography



                variant="body2"



                color="text.secondary"



                sx={{ fontStyle: "italic" }}



              >



                {t("jobSeeker:profile.cv.emptySubtitle")}



              </Typography>



            </Stack>



          ) : (



            <Stack spacing={3}>



              <Box



                sx={{



                  borderRadius: 2,



                  overflow: "hidden",



          boxShadow: (theme: Theme) => theme.customShadows.small,



                }}



              >



                <Suspense

                  fallback={(

                    <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>

                      <Typography variant="subtitle2" color="text.secondary">

                        {t("jobSeeker:profile.cv.loadingPreview")}

                      </Typography>

                    </Stack>

                  )}

                >

                  <LazyPdf title={cv.title} fileUrl={cv.fileUrl} />

                </Suspense>

              </Box>



            </Stack>



          )}



        </Box>



      </Stack>



      {/* Start: form  */}



      <FormPopup



        title={t("jobSeeker:profile.cv.updateTitle")}



        openPopup={openPopup}



        setOpenPopup={setOpenPopup}



      >



        <CVForm handleUpdate={handleUpdate as (data: CVFormValues) => void} />



      </FormPopup>



      {/* Start: full screen loading */}



      {isFullScreenLoading && <BackdropLoading />}



    </>



  );



};



export default CVCard;
