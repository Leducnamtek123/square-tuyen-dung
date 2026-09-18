import React from "react";
import { useParams } from 'next/navigation';
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { Box, Card, Stack, Typography } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import errorHandling from "@/utils/errorHandling";
import toastMessages from "@/utils/toastMessages";
import SocialNetworkSharingPopup from "@/components/Common/SocialNetworkSharingPopup/SocialNetworkSharingPopup";
import TrustReportDialog from "@/components/Features/TrustReportDialog";
import NoDataCard from "@/components/Common/NoDataCard";
import companyService from "@/services/companyService";
import FilterJobPostCard from "@/views/components/defaults/FilterJobPostCard";
import CompanyDetailLoading from "./components/CompanyDetailLoading";
import { useAppSelector } from "@/hooks/useAppStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import useSEO from "@/hooks/useSEO";
import useStructuredData from "@/hooks/useStructuredData";
import sanitizeHtml from "@/utils/sanitizeHtml";

import CompanyHeader from "./CompanyHeader";
import CompanyAbout from "./CompanyAbout";
import CompanySidebar from "./CompanySidebar";
import { useConfig } from '@/hooks/useConfig';
import useRequireAuth from '@/hooks/useRequireAuth';
import { Theme } from "@mui/material/styles";
import type { CompanyDetailProps } from './types';

const CompanyDetailPage = () => {
  const { t } = useTranslation("public");
  const { slug } = useParams();
  const { allConfig } = useConfig();
  const { isAuthenticated, currentUser } = useAppSelector((state) => state.user);
  const { requireAuth, AuthModal } = useRequireAuth();

  const [openSharePopup, setOpenSharePopup] = React.useState(false);
  const [openReportPopup, setOpenReportPopup] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: fetchRes, isLoading } = useQuery({
    queryKey: ['companyDetail', slug],
    queryFn: () => companyService.getCompanyDetailById(slug as string),
    enabled: !!slug && slug !== ':slug'
  });

  const companyDetail = React.useMemo(() => {
    if (!fetchRes) return null;
    return fetchRes as CompanyDetailProps;
  }, [fetchRes]);

  const imageList = React.useMemo(() => {
    if (!companyDetail?.companyImages || !Array.isArray(companyDetail.companyImages)) return [];
    return companyDetail.companyImages.map((img: { imageUrl: string }) => ({ original: img.imageUrl, thumbnail: img.imageUrl }));
  }, [companyDetail?.companyImages]);

  const safeDescriptionHtml = React.useMemo(() => sanitizeHtml(companyDetail?.description), [companyDetail?.description]);

  const stripHtml = (html: string) => (html || '').replace(/<[^>]*>/g, '').slice(0, 160);

  useSEO({
    title: companyDetail?.companyName,
    description: companyDetail ? `${companyDetail.companyName} - ${companyDetail.fieldOperation || t('seo.companyDetail.recruitingCompany')}. ${stripHtml(companyDetail.description || '')} ${t('seo.companyDetail.hiringLabel')}` : undefined,
    image: companyDetail?.companyImageUrl || undefined,
    url: (typeof window !== 'undefined' ? window.location.href : ''),
    type: 'article',
    keywords: companyDetail ? `${companyDetail.companyName}, ${t('seo.companyDetail.keywordsSuffix')}, ${companyDetail.fieldOperation || ''}` : undefined,
  });

  useStructuredData(
    companyDetail ? [
      {
        type: 'Organization' as const,
        name: companyDetail.companyName || '',
        url: companyDetail.websiteUrl || (typeof window !== 'undefined' ? window.location.href : ''),
        logoUrl: companyDetail.companyImageUrl || '',
        description: companyDetail.description || '',
        email: companyDetail.companyEmail,
        phone: companyDetail.companyPhone,
        address: companyDetail.location?.address,
        city: typeof companyDetail.locationDict?.city === 'string' ? companyDetail.locationDict.city : undefined,
        country: 'VN',
        foundingDate: companyDetail.since ? dayjs(companyDetail.since).format('YYYY') : undefined,
        numberOfEmployees: companyDetail.employeeSize ? String(companyDetail.employeeSize) : undefined,
        sameAs: [companyDetail.facebookUrl, companyDetail.linkedinUrl, companyDetail.websiteUrl].filter((url): url is string => Boolean(url)),
      },
      {
        type: 'BreadcrumbList' as const,
        items: [
          { name: t('seo.companyDetail.breadcrumb.home'), url: (typeof window !== 'undefined' ? window.location.origin : '') },
          { name: t('seo.companyDetail.breadcrumb.company'), url: `${(typeof window !== 'undefined' ? window.location.origin : '')}/cong-ty` },
          { name: companyDetail.companyName || '', url: (typeof window !== 'undefined' ? window.location.href : '') },
        ],
      },
    ] : []
  );

  const followMutation = useMutation({
    mutationFn: (companySlug: string) => companyService.followCompany(companySlug),
    onSuccess: (resData: { isFollowed: boolean }) => {
      const isFollowed = resData.isFollowed;
      queryClient.setQueryData<CompanyDetailProps | null>(['companyDetail', slug], (old) => {
        if (!old) return old;
        return {
          ...old,
          isFollowed,
          followNumber: isFollowed ? (old.followNumber || 0) + 1 : (old.followNumber || 0) - 1
        };
      });
      toastMessages.success(isFollowed ? t("companyDetail.followedSuccessfully") : t("companyDetail.unfollowedSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ['companiesFollowed'] });
    }
  });

  const handleFollow = () => {
    if (!requireAuth({ actionType: 'follow_company' })) return;
    if (slug) followMutation.mutate(slug as string);
  };

  const handleOpenReport = () => {
    if (!requireAuth({ actionType: 'report', title: 'Báo cáo doanh nghiệp', message: 'Vui lòng đăng nhập để gửi báo cáo về công ty này.' })) return;
    setOpenReportPopup(true);
  };

  return isLoading ? <CompanyDetailLoading /> : companyDetail === null ? <NoDataCard /> : (
    <>
      <Box sx={{ mt: { xs: 1, md: 2 }, pb: { xs: 12, md: 6 } }}>
        <Stack spacing={{ xs: 2, md: 3 }}>
          <CompanyHeader companyDetail={companyDetail} allConfig={allConfig} isAuthenticated={isAuthenticated} currentUser={currentUser} isLoadingFollow={followMutation.isPending} handleFollow={handleFollow} setOpenSharePopup={setOpenSharePopup} setOpenReportPopup={handleOpenReport} t={t} />
          <Box>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Card sx={{ p: { xs: 2, sm: 3 }, borderRadius: { xs: 2.5, md: 3 }, boxShadow: (theme: Theme & { customShadows?: Record<string, string> }) => theme.customShadows?.small || 1 }}>
                  <Stack spacing={{ xs: 3, md: 4 }}>
                    <CompanyAbout companyDetail={companyDetail} safeDescriptionHtml={safeDescriptionHtml} t={t} />
                    <Box>
                      <Typography
                        variant="h5"
                        gutterBottom
                        sx={{
                          color: "#0f172a",
                          fontWeight: 700,
                          fontSize: { xs: '1.15rem', sm: '1.25rem', md: '1.4rem' },
                          mb: { xs: 2, md: 2.5 },
                          letterSpacing: '-0.01em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.25,
                          '&::before': {
                            content: '""',
                            width: 4,
                            height: 18,
                            borderRadius: 2,
                            bgcolor: 'primary.main',
                            display: 'inline-block',
                          }
                        }}
                      >
                        {t("companyDetail.hiring")}
                      </Typography>
                      <FilterJobPostCard params={{ companyId: companyDetail.id }} hideHeader />
                    </Box>
                  </Stack>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CompanySidebar companyDetail={companyDetail} imageList={imageList} t={t} />
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </Box>

      <SocialNetworkSharingPopup
        {...({
          open: openSharePopup,
          setOpenPopup: setOpenSharePopup,
          facebook: { url: (typeof window !== 'undefined' ? window.location.href : '') },
          facebookMessenger: { url: (typeof window !== 'undefined' ? window.location.href : '') },
          linkedin: { url: (typeof window !== 'undefined' ? window.location.href : ''), source: (typeof window !== 'undefined' ? window.location.href : ''), title: companyDetail?.companyName, summary: companyDetail?.description },
          twitter: { url: (typeof window !== 'undefined' ? window.location.href : ''), title: companyDetail?.companyName },
          email: { url: (typeof window !== 'undefined' ? window.location.href : ''), subject: companyDetail?.companyName, body: companyDetail?.description },
        } as React.ComponentProps<typeof SocialNetworkSharingPopup>)}
      />

      <TrustReportDialog
        openPopup={openReportPopup}
        setOpenPopup={setOpenReportPopup}
        targetType="company"
        companyId={companyDetail.id}
        targetName={companyDetail.companyName}
      />

      {AuthModal}
    </>
  );
};

export default CompanyDetailPage;
