import React from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { Box, Card, IconButton, Link, Stack, Typography, Button } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { LoadingButton } from "@mui/lab";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faUsers,
  faCalendarDays,
  faGlobe,
  faEnvelope,
  faPhoneVolume,
  faHashtag,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { TabTitle } from "../../../utils/generalFunction";
import { ICONS, IMAGES, ROLES_NAME } from "../../../configs/constants";
import errorHandling from "../../../utils/errorHandling";
import toastMessages from "../../../utils/toastMessages";
import Map from "../../../components/Map";
import QRCodeBox from "../../../components/QRCodeBox";
import SocialNetworkSharingPopup from "../../../components/SocialNetworkSharingPopup/SocialNetworkSharingPopup";
import ShareIcon from "@mui/icons-material/Share";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import MuiImageCustom from "../../../components/MuiImageCustom";
import NoDataCard from "../../../components/NoDataCard";
import ImageGalleryCustom from "../../../components/ImageGalleryCustom";
import companyService from "../../../services/companyService";
import FilterJobPostCard from "../../components/defaults/FilterJobPostCard";
import CompanyDetailLoading from "./components/CompanyDetailLoading";
import { useAppSelector } from "../../../hooks/useAppStore";
import type { AxiosError } from "axios";



const sanitizeCompanyDescription = (rawHtml: string | undefined) => {
  if (!rawHtml || typeof rawHtml !== "string") {
    return "";
  }
  if (typeof window === "undefined") {
    return rawHtml;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");

  doc
    .querySelectorAll("script,style,iframe,object,embed,link,meta")
    .forEach((node) => node.remove());

  doc.querySelectorAll("*").forEach((element) => {
    Array.from(element.attributes).forEach((attr) => {
      const attrName = attr.name.toLowerCase();
      const attrValue = (attr.value || "").trim().toLowerCase();
      if (attrName.startsWith("on")) {
        element.removeAttribute(attr.name);
      }
      if ((attrName === "href" || attrName === "src") && attrValue.startsWith("javascript:")) {
        element.removeAttribute(attr.name);
      }
    });
  });

  return doc.body.innerHTML;
};

const CompanyDetailPage = () => {
  const { t } = useTranslation("public");
  const { slug } = useParams();

  const { allConfig } = useAppSelector((state) => state.config);

  const { isAuthenticated, currentUser } = useAppSelector((state) => state.user);

  const [openSharePopup, setOpenSharePopup] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(true);

  const [isLoadingFollow, setIsLoadingFollow] = React.useState(false);

  const [companyDetail, setCompanyDetail] = React.useState<any>(null);

  const [imageList, setImageList] = React.useState<any[]>([]);
  const safeDescriptionHtml = React.useMemo(
    () => sanitizeCompanyDescription(companyDetail?.description),
    [companyDetail?.description]
  );

  React.useEffect(() => {

    const getCompanyDetail = async (companySlug: string | undefined) => {

      try {

        const resData = await companyService.getCompanyDetailById(companySlug as string) as any;

        const data = resData;

        const companyImages = data?.companyImages || [];

        setCompanyDetail(data);

        TabTitle(data?.companyName);

        var imagelistNew = [];

        for (let i = 0; i < companyImages.length; i++) {

          imagelistNew.push({

            original: companyImages[i].imageUrl,

            thumbnail: companyImages[i].imageUrl,

          });

        }

        setImageList(imagelistNew);

      } catch (error) {

      } finally {

        setIsLoading(false);

      }

    };

    getCompanyDetail(slug);

  }, [slug]);

  const handleFollow = () => {

    const follow = async () => {

      setIsLoadingFollow(true);

      try {

        const resData = await companyService.followCompany(slug as string) as any;

        const isFollowed = resData.isFollowed;

        setCompanyDetail({

          ...companyDetail,

          isFollowed: isFollowed,

          followNumber: isFollowed

            ? companyDetail.followNumber + 1

            : companyDetail.followNumber - 1,

        });

        toastMessages.success(
          isFollowed ? t("companyDetail.followedSuccessfully") : t("companyDetail.unfollowedSuccessfully")
        );

      } catch (error) {

        errorHandling(error as AxiosError<any>);

      } finally {

        setIsLoadingFollow(false);

      }

    };

    follow();

  };

  return isLoading ? (

    <CompanyDetailLoading />

  ) : companyDetail === null ? (

    <NoDataCard />

  ) : (

    <>

      <Box>

        <Stack spacing={2}>

          <Card

            sx={{

              overflow: "visible",

              boxShadow: (theme: any) => theme.customShadows.medium,

            }}

          >

            <Box>

              <MuiImageCustom

                src={

                  companyDetail?.companyCoverImageUrl ||
                  IMAGES.companyCoverDefault ||
                  IMAGES.coverImageDefault

                }

                sx={{

                  maxHeight: 250,

                  minHeight: 200,

                }}

                duration={1500}

                width="100%"

                fit="cover"

              />

            </Box>

            <Box sx={{ p: 3, pt: 1 }}>

              <Stack

                direction={{

                  xs: "column",

                  sm: "column",

                  md: "row",

                  lg: "row",

                  xl: "row",

                }}

                spacing={3}

                alignItems="center"

              >

                <Box>

                  <MuiImageCustom

                    src={companyDetail.companyImageUrl || IMAGES.companyLogoDefault}

                    sx={{

                      borderRadius: 2,

                      mt: -7,

                      p: 1,

                      bgcolor: "white",

                      boxShadow: (theme: any) => theme.customShadows.small,

                      border: "2px solid #fff",

                    }}

                    duration={1500}

                    width={120}

                    height={120}

                  />

                </Box>

                <Box flex={1}>

                  <Box>

                    <Typography

                      variant="h4"

                      gutterBottom

                      sx={{

                        textAlign: {

                          xs: "center",

                          sm: "center",

                          md: "left",

                        },

                        color: "primary.main",

                        fontWeight: 600,

                      }}

                    >

                      {companyDetail.companyName}

                    </Typography>

                  </Box>

                  <Stack

                    direction={{

                      xs: "column",

                      sm: "row",

                    }}

                    spacing={3}

                    sx={{

                      "& .MuiTypography-root": {

                        color: "text.secondary",

                        display: "flex",

                        alignItems: "center",

                        gap: 1,

                        "& svg": {

                          color: "primary.main",

                          fontSize: "1.2rem",

                        },

                      },

                    }}

                  >

                    <Typography variant="subtitle1">

                      <FontAwesomeIcon icon={faBriefcase} />

                      {companyDetail.fieldOperation}

                    </Typography>

                    <Typography variant="subtitle1">

                      <FontAwesomeIcon icon={faUsers} />

                      {(allConfig as any)?.employeeSizeDict[
                         companyDetail.employeeSize
                       ] || (
                        <span
                          style={{
                            color: "#e0e0e0",
                            fontStyle: "italic",
                            fontSize: 13,
                          }}
                        >
                          {t("companyDetail.notUpdated")}
                        </span>
                       )}

                    </Typography>

                    <Typography variant="subtitle1">

                      <FontAwesomeIcon icon={faCalendarDays} />

                      {t("companyDetail.since", { year: dayjs(companyDetail?.since).format("YYYY") })}

                    </Typography>

                  </Stack>

                </Box>

                <Box sx={{ pt: 1 }}>

                    <QRCodeBox value={window.location.href || "-"} size={80} label={t("companyDetail.shareWithQr")} />

                </Box>

                <Stack spacing={1.5} justifyContent="center">

                  {isAuthenticated &&

                    currentUser?.roleName === ROLES_NAME.JOB_SEEKER && (

                      <LoadingButton

                        onClick={handleFollow}

                        startIcon={

                          companyDetail.isFollowed ? (

                            <BookmarkIcon />

                          ) : (

                            <BookmarkBorderIcon />

                          )

                        }

                        loading={isLoadingFollow}

                        loadingPosition="start"

                        variant={

                          companyDetail.isFollowed ? "contained" : "outlined"

                        }

                        color="primary"

                        sx={{

                          minWidth: 160,

                          borderRadius: 2,

                          boxShadow: "none",

                        }}

                      >

                        <span>

                          {companyDetail.isFollowed
                            ? t("companyDetail.followed")
                            : t("companyDetail.follow")}{" "}
                          ({companyDetail.followNumber})

                        </span>

                      </LoadingButton>

                    )}

                  <Button

                    variant="contained"

                    color="secondary"

                    startIcon={<ShareIcon />}

                    onClick={() => setOpenSharePopup(true)}

                    sx={{

                      minWidth: 160,

                      borderRadius: 2,

                      boxShadow: "none",

                    }}

                  >

                    {t("companyDetail.share")}

                  </Button>

                </Stack>

              </Stack>

            </Box>

          </Card>

          <Box>

            <Grid container spacing={3}>

              <Grid

                size={{

                  xs: 12,

                  md: 8

                }}>

                <Card

                  sx={{

                    p: 3,

                    boxShadow: (theme: any) => theme.customShadows.small,

                  }}

                >

                  <Stack spacing={4}>

                    <Box>

                      <Typography

                        variant="h5"

                        gutterBottom

                        sx={{

                          color: "primary.main",

                          fontWeight: 600,

                          mb: 3,

                        }}

                      >

                        {t("companyDetail.about")}

                      </Typography>

                      <Box

                        sx={{

                          p: 2.5,

                          borderRadius: 2,

                          bgcolor: "grey.50",

                        }}

                      >

                        <Typography

                          sx={{

                            textAlign: "justify",

                            color: "text.secondary",

                            lineHeight: 1.8,

                          }}

                        >

                          {companyDetail?.description ? (

                            <div

                              dangerouslySetInnerHTML={{

                                __html: safeDescriptionHtml,

                              }}

                            ></div>

                          ) : (

                            <span

                              style={{

                                color: "#e0e0e0",

                                fontStyle: "italic",

                                fontSize: 13,

                              }}

                            >

                              {t("companyDetail.notUpdated")}

                            </span>

                          )}

                        </Typography>

                      </Box>

                    </Box>

                    <Box>

                      <Typography

                        variant="h5"

                        gutterBottom

                        sx={{

                          color: "primary.main",

                          fontWeight: 600,

                          mb: 3,

                        }}

                      >

                        {t("companyDetail.hiring")}

                      </Typography>

                      <FilterJobPostCard

                        params={{

                          companyId: companyDetail.id,

                        }}

                      />

                    </Box>

                  </Stack>

                </Card>

              </Grid>

              <Grid

                size={{

                  xs: 12,

                  md: 4

                }}>

                <Card

                  sx={{

                    p: 3,

                    boxShadow: (theme: any) => theme.customShadows.small,

                  }}

                >

                  <Stack spacing={3}>

                    <Box>

                      <Typography

                        variant="h6"

                        sx={{

                          color: "primary.main",

                          mb: 2,

                        }}

                      >

                        {t("companyDetail.website")}

                      </Typography>

                      <Typography

                        sx={{

                          display: "flex",

                          alignItems: "center",

                          gap: 1,

                          color: "text.secondary",

                          "& svg": {

                            color: "primary.main",

                          },

                        }}

                      >

                        <FontAwesomeIcon icon={faGlobe} />

                        {companyDetail.websiteUrl ? (

                          <Link

                            target="_blank"

                            href={companyDetail.websiteUrl}

                            sx={{

                              color: "primary.main",

                              textDecoration: "none",

                              "&:hover": {

                                textDecoration: "underline",

                              },

                            }}

                          >

                            {companyDetail.websiteUrl}

                          </Link>

                        ) : (
                            t("companyDetail.notUpdated")
                        )}

                      </Typography>

                    </Box>

                    {/* Social Media Links */}

                    <Box>

                      <Typography

                        variant="h6"

                        sx={{

                          color: "primary.main",

                          mb: 2,

                        }}

                      >

                        {t("companyDetail.followAt")}

                      </Typography>

                      <Stack

                        direction="row"

                        spacing={1}

                        sx={{

                          "& .MuiIconButton-root": {

                            bgcolor: "grey.50",

                            transition: "all 0.2s",

                            "&:hover": {

                              transform: "translateY(-2px)",

                            },

                          },

                        }}

                      >

                        {companyDetail?.facebookUrl && (

                          <IconButton color="primary" aria-label="facebook">

                            <img width="30" src={ICONS.FACEBOOK} alt="" />

                          </IconButton>

                        )}

                        {companyDetail?.youtubeUrl && (

                          <IconButton color="primary" aria-label="youtube">

                            <img width="30" src={ICONS.YOUTUBE} alt="" />

                          </IconButton>

                        )}

                        {companyDetail?.linkedinUrl && (

                          <IconButton color="primary" aria-label="linked">

                            <img width="30" src={ICONS.LINKEDIN} alt="" />

                          </IconButton>

                        )}

                      </Stack>

                    </Box>

                    {/* Company Info */}

                    <Box>

                      <Typography

                        variant="h6"

                        sx={{

                          color: "primary.main",

                          mb: 2,

                        }}

                      >

                        {t("companyDetail.generalInfo")}

                      </Typography>

                      <Stack

                        spacing={2}

                        sx={{

                          "& .MuiTypography-root": {

                            display: "flex",

                            alignItems: "center",

                            gap: 1,

                            color: "text.secondary",

                            "& svg": {

                              color: "primary.main",

                            },

                          },

                        }}

                      >

                        <Typography>

                          <FontAwesomeIcon

                            icon={faEnvelope}

                            style={{ marginRight: 6 }}

                          />{" "}

                          {companyDetail.companyEmail}

                        </Typography>

                        <Typography sx={{ mt: 1 }}>

                          <FontAwesomeIcon

                            icon={faPhoneVolume}

                            style={{ marginRight: 6 }}

                          />{" "}

                          {companyDetail.companyPhone}

                        </Typography>

                        <Typography sx={{ mt: 1 }}>

                          <FontAwesomeIcon

                            icon={faHashtag}

                            style={{ marginRight: 6 }}

                          />{" "}

                          {companyDetail.taxCode}

                        </Typography>

                        <Typography sx={{ mt: 1 }}>

                          <FontAwesomeIcon

                            icon={faLocationDot}

                            style={{ marginRight: 6 }}

                          />{" "}

                          {companyDetail.location?.address || (

                            <span

                              style={{

                                color: "#e0e0e0",

                                fontStyle: "italic",

                                fontSize: 13,

                              }}

                            >

                              {t("companyDetail.notUpdated")}

                            </span>

                          )}

                        </Typography>

                      </Stack>

                    </Box>

                    {/* Map */}

                    <Box>

                      <Typography

                        variant="h6"

                        sx={{

                          color: "primary.main",

                          mb: 2,

                        }}

                      >

                        {t("companyDetail.map")}

                      </Typography>

                      <Box

                        sx={{

                          borderRadius: 2,

                          overflow: "hidden",

                          border: "1px solid",

                          borderColor: "grey.200",

                        }}

                      >

                        <Map
                          title={companyDetail?.companyName}
                          subTitle={companyDetail?.address}
                          latitude={companyDetail?.lat}
                          longitude={companyDetail?.lng}
                        />

                      </Box>

                    </Box>

                    {/* Image Gallery */}

                    {imageList.length > 0 && (

                      <Box>

                        <Typography

                          variant="h6"

                          sx={{

                            color: "primary.main",

                            mb: 2,

                          }}

                        >

                          {t("companyDetail.images")}

                        </Typography>

                        <Box

                          sx={{

                            borderRadius: 2,

                            overflow: "hidden",

                            border: "1px solid",

                            borderColor: "grey.200",

                          }}

                        >

                          <ImageGalleryCustom images={imageList} />

                        </Box>

                      </Box>

                    )}

                  </Stack>

                </Card>

              </Grid>

            </Grid>

          </Box>

        </Stack>

      </Box>

      {/* Start: SocialNetworkSharingPopup */}

        <SocialNetworkSharingPopup
          {...({
            open: openSharePopup,
            setOpenPopup: setOpenSharePopup,
            facebook: {
              url: window.location.href,
            },
            facebookMessenger: {
              url: window.location.href,
            },
            linkedin: {
              url: window.location.href,
              source: window.location.href,
              title: companyDetail?.companyName,
              summary: companyDetail?.description,
            },
            twitter: {
              url: window.location.href,
              title: companyDetail?.companyName,
            },
            email: {
              url: window.location.href,
              subject: companyDetail?.companyName,
              body: companyDetail?.description,
            },
          } as any)}
        />

      {/* End: SocialNetworkSharingPopup */}

    </>

  );

};

export default CompanyDetailPage;
