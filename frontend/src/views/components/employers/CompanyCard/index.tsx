import React from "react";

import { Box, Button, Stack, Typography, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";

import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";

import {
  convertEditorStateToHTMLString,
  createEditorStateFromHTMLString,
} from "../../../../utils/editorUtils";

import toastMessages from "../../../../utils/toastMessages";

import errorHandling from "../../../../utils/errorHandling";

import BackdropLoading from "../../../../components/Common/Loading/BackdropLoading";

import CompanyForm from "../CompanyForm";

import companyService from "../../../../services/companyService";

import { compressImageFile } from "../../../../utils/imageCompression";

import MuiImageCustom from "../../../../components/Common/MuiImageCustom";

const CompanyCard = () => {
  const { t } = useTranslation("employer");

  const [isSuccess, setIsSuccess] = React.useState(false);

  const [isLoadingCompany, setIsLoadingCompany] = React.useState(true);

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  const [editData, setEditData] = React.useState<any>(null);

  const [companyImageUrl, setCompanyImageUrl] = React.useState<string | null>(null);

  const [companyCoverImageUrl, setCompanyCoverImageUrl] = React.useState<string | null>(null);

  const [serverErrors, setServerErrors] = React.useState<any>(null);

  const logoInputRef = React.useRef<HTMLInputElement>(null);

  const coverInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {

    const loadCompany = async () => {

      setIsLoadingCompany(true);

      try {

        const resData = await companyService.getCompany() as any;

        var data = resData;

        data = {

          ...data,

          description: createEditorStateFromHTMLString(data?.description || ""),

        };

        setEditData(data);

        if (companyImageUrl === null) {

          setCompanyImageUrl(data?.companyImageUrl);

        }

        if (companyCoverImageUrl === null) {

          setCompanyCoverImageUrl(data?.companyCoverImageUrl);

        }

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsLoadingCompany(false);

      }

    };

    loadCompany();



  }, [isSuccess, companyCoverImageUrl, companyImageUrl]);

  const handleUpdate = (data: any) => {

    const update = async (id: any, data: any) => {

      setIsFullScreenLoading(true);

      try {

        await companyService.updateCompany(id, data);

        setIsSuccess(!isSuccess);

        if (serverErrors !== null) setServerErrors(null);

        toastMessages.success(t("companyProfile.success.update", "Company information updated successfully."));

      } catch (error: any) {

        errorHandling(error, setServerErrors);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    const dataCustom = {

      ...data,

      description: convertEditorStateToHTMLString(data.description),

    };

    update(dataCustom?.id, dataCustom);

  };

  const handleUpdateCompanyImageUrl = async (file: File) => {

    setIsFullScreenLoading(true);

    try {

      const compressed = await compressImageFile(file);

      const formData = new FormData();

      formData.append("file", compressed);

      const resData = await companyService.updateCompanyImageUrl(formData) as any;

      const data = resData;

      toastMessages.success(t("companyProfile.success.logoUpdate", "Company logo updated successfully."));

      setCompanyImageUrl(data?.companyImageUrl);

    } catch (error: any) {

      errorHandling(error);

    } finally {

      setIsFullScreenLoading(false);

    }

  };

  const handleUpdateCompanyCoverImageUrl = async (file: File) => {

    setIsFullScreenLoading(true);

    try {

      const compressed = await compressImageFile(file);

      const formData = new FormData();

      formData.append("file", compressed);

      const resData = await companyService.updateCompanyCoverImageUrl(

        formData

      ) as any;

      const data = resData;

      toastMessages.success(t("companyProfile.success.coverUpdate", "Company cover image updated successfully."));

      setCompanyCoverImageUrl(data?.companyCoverImageUrl);

    } catch (error: any) {

      errorHandling(error);

    } finally {

      setIsFullScreenLoading(false);

    }

  };

  return (

    <Paper elevation={0}>

      <Stack spacing={4}>

        <Box>

          <Typography

            variant="subtitle1"

            sx={{

              mb: 2,

              fontWeight: 600,

              color: "text.primary",

            }}

          >

            {t("companyProfile.labels.logo", "Company Logo")}

          </Typography>

          <Box sx={{ position: "relative" }}>

            <MuiImageCustom

              src={companyImageUrl || ''}

              width={120}

              height={120}

              sx={{

                borderRadius: 2,

                border: (theme: any) => `1px solid ${theme.palette.grey[200]}`,

                boxShadow: (theme: any) => theme.customShadows.small,

              }}

            />

            <Box sx={{ mt: 2 }}>

              <Button

                variant="contained"

                size="small"

                startIcon={<CameraAltOutlinedIcon />}

                onClick={() => logoInputRef.current?.click()}

                sx={{

                  borderRadius: 2,

                  textTransform: "none",

                  boxShadow: "none",

                }}

              >

                {t("companyProfile.labels.changeLogo", "Change Logo")}

              </Button>

            </Box>

          </Box>

        </Box>

        <Box>

          <Typography

            variant="subtitle1"

            sx={{

              mb: 2,

              fontWeight: 600,

              color: "text.primary",

            }}

          >

            {t("companyProfile.labels.cover", "Company Cover Image")}

          </Typography>

          <Box sx={{ position: "relative" }}>

            <MuiImageCustom

              src={companyCoverImageUrl || ''}

              height={160}

              width="60%"

              sx={{

                borderRadius: 2,

                border: (theme: any) => `1px solid ${theme.palette.grey[200]}`,

                boxShadow: (theme: any) => theme.customShadows.small,

              }}

              fit="cover"

            />

            <Box sx={{ mt: 2 }}>

              <Button

                variant="contained"

                size="small"

                startIcon={<CameraAltOutlinedIcon />}

                onClick={() => coverInputRef.current?.click()}

                sx={{

                  borderRadius: 2,

                  textTransform: "none",

                  boxShadow: "none",

                }}

              >

                {t("companyProfile.labels.changeCover", "Change Cover")}

              </Button>

            </Box>

          </Box>

        </Box>

        <Box>

          {isLoadingCompany ? (

            <CompanyForm.Loading />

          ) : (

            <>

              <CompanyForm

                handleUpdate={handleUpdate}

                editData={editData}

                serverErrors={serverErrors as any}

              />

              <Box sx={{ mt: 3 }}>

                <Button

                  variant="contained"

                  color="primary"

                  startIcon={<SaveOutlinedIcon />}

                  type="submit"

                  form="company-form"

                  sx={{

                    px: 4,

                    py: 1,

                    fontSize: "0.9rem",

                    background: (theme) => theme.palette.primary.main,

                    "&:hover": {

                      background: (theme) => theme.palette.primary.main,

                      opacity: 0.9,

                      boxShadow: (theme) => theme.customShadows.medium,

                    },

                  }}

                >

                  {t("companyProfile.labels.update", "Update")}

                </Button>

              </Box>

            </>

          )}

        </Box>

      </Stack>

      <input

        ref={logoInputRef}

        type="file"

        accept="image/*"

        style={{ display: "none" }}

        onChange={(event) => {

          const file = event.target.files?.[0];

          if (!file) return;

          handleUpdateCompanyImageUrl(file);

          event.target.value = "";

        }}

      />

      <input

        ref={coverInputRef}

        type="file"

        accept="image/*"

        style={{ display: "none" }}

        onChange={(event) => {

          const file = event.target.files?.[0];

          if (!file) return;

          handleUpdateCompanyCoverImageUrl(file);

          event.target.value = "";

        }}

      />

      {isFullScreenLoading && <BackdropLoading />}

    </Paper>

  );

};

export default CompanyCard;
