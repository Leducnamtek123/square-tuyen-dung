import React from "react";
import { useParams } from 'next/navigation';
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { Box, Card, Stack, Typography } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import errorHandling from "../../../utils/errorHandling";
import toastMessages from "../../../utils/toastMessages";
import SocialNetworkSharingPopup from "../../../components/Common/SocialNetworkSharingPopup/SocialNetworkSharingPopup";
import NoDataCard from "../../../components/Common/NoDataCard";
import companyService from "../../../services/companyService";
import FilterJobPostCard from "../../components/defaults/FilterJobPostCard";
import CompanyDetailLoading from "./components/CompanyDetailLoading";
import { useAppSelector } from "../../../hooks/useAppStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import useSEO from "../../../hooks/useSEO";
import useStructuredData from "../../../hooks/useStructuredData";

import CompanyHeader from "./CompanyHeader";
import CompanyAbout from "./CompanyAbout";
import CompanySidebar from "./CompanySidebar";
import { useConfig } from '@/hooks/useConfig';
import { Theme } from "@mui/material/styles";

export type CompanyDetailProps = {
  id?: number | string;
  companyName?: string;
  description?: string;
  fieldOperation?: string;
  companyImageUrl?: string;
  websiteUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
  cityName?: string;
  since?: string;
  employeeSize?: number;
  facebookUrl?: string;
  linkedinUrl?: string;
  followNumber?: number;
  isFollowed?: boolean;
  [key: string]: unknown;
};

const sanitizeCompanyDescription = (rawHtml: string | undefined) => {
  if (!rawHtml || typeof rawHtml !== "string") return "";
  if (typeof window === "undefined") return rawHtml;
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");
  doc.querySelectorAll("script,style,iframe,object,embed,link,meta").forEach((node) => node.remove());
  doc.querySelectorAll("*").forEach((element) => {
    Array.from(element.attributes).forEach((attr) => {
      const attrName = attr.name.toLowerCase();
      const attrValue = (attr.value || "").trim().toLowerCase();
      if (attrName.startsWith("on")) element.removeAttribute(attr.name);
      if ((attrName === "href" || attrName === "src") && attrValue.startsWith("javascript:")) element.removeAttribute(attr.name);
    });
  });
  return doc.body.innerHTML;
};

const CompanyDetailPage = () => {
  const { t } = useTranslation("public");
  const { slug } = useParams();
  const { allConfig } = useConfig();
  const { isAuthenticated, currentUser } = useAppSelector((state) => state.user);

  const [openSharePopup, setOpenSharePopup] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: fetchRes, isLoading } = useQuery({
    queryKey: ['companyDetail', slug],
    queryFn: () => companyService.getCompanyDetailById(slug as string),
    enabled: !!slug
  });

  const companyDetail = React.useMemo(() => {
    if (!fetchRes) return null;
    return fetchRes as unknown as { companyImages?: { imageUrl: string }[] } & CompanyDetailProps;
  }, [fetchRes]);

  const imageList = React.useMemo(() => {
    if (!companyDetail?.companyImages) return [];
    return companyDetail.companyImages.map(img => ({ original: img.imageUrl, thumbnail: img.imageUrl }));
  }, [companyDetail?.companyImages]);

  const safeDescriptionHtml = React.useMemo(() => sanitizeCompanyDescription(companyDetail?.description), [companyDetail?.description]);

  const stripHtml = (html: string) => (html || '').replace(/<[^>]*>/g, '').slice(0, 160);

  useSEO({
    title: companyDetail?.companyName,
    description: companyDetail ? `${companyDetail.companyName} - ${companyDetail.fieldOperation || 'Công ty tuyển dụng'}. ${stripHtml(companyDetail.description || '')} Xem việc làm đang tuyển.` : undefined,
    image: companyDetail?.companyImageUrl || undefined,
    url: (typeof window !== 'undefined' ? window.location.href : ''),
    type: 'article',
    keywords: companyDetail ? `${companyDetail.companyName}, tuyển dụng, việc làm, ${companyDetail.fieldOperation || ''}` : undefined,
  });

  useStructuredData(
    companyDetail ? [
      {
        type: 'Organization' as const,
        name: companyDetail.companyName || '',
        url: companyDetail.websiteUrl || (typeof window !== 'undefined' ? window.location.href : ''),
        logoUrl: companyDetail.companyImageUrl || '',
        description: companyDetail.description || '',
        email: companyDetail.email,
        phone: companyDetail.phone,
        address: companyDetail.address,
        city: companyDetail.cityName,
        country: 'VN',
        foundingDate: companyDetail.since ? dayjs(companyDetail.since).format('YYYY') : undefined,
        numberOfEmployees: companyDetail.employeeSize ? String(companyDetail.employeeSize) : undefined,
        sameAs: [companyDetail.facebookUrl, companyDetail.linkedinUrl, companyDetail.websiteUrl].filter((url): url is string => Boolean(url)),
      },
      {
        type: 'BreadcrumbList' as const,
        items: [
          { name: 'Trang chủ', url: (typeof window !== 'undefined' ? window.location.origin : '') },
          { name: 'Công ty', url: `${(typeof window !== 'undefined' ? window.location.origin : '')}/cong-ty` },
          { name: companyDetail.companyName || '', url: (typeof window !== 'undefined' ? window.location.href : '') },
        ],
      },
    ] : []
  );

  const followMutation = useMutation({
    mutationFn: (companySlug: string) => companyService.followCompany(companySlug),
    onSuccess: (resData: unknown) => {
      const isFollowed = (resData as { isFollowed: boolean }).isFollowed;
      queryClient.setQueryData(['companyDetail', slug], (old: unknown) => {
        if (!old) return old;
        const oldData = old as Record<string, unknown> & CompanyDetailProps;
        return {
          ...oldData,
          isFollowed,
          followNumber: isFollowed ? (oldData.followNumber || 0) + 1 : (oldData.followNumber || 0) - 1
        };
      });
      toastMessages.success(isFollowed ? t("companyDetail.followedSuccessfully") : t("companyDetail.unfollowedSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ['companiesFollowed'] });
    }
  });

  const handleFollow = () => {
    if (slug) followMutation.mutate(slug as string);
  };

  return isLoading ? <CompanyDetailLoading /> : companyDetail === null ? <NoDataCard /> : (
    <>
      <Box sx={{ mt: 2 }}>
        <Stack spacing={2}>
          <CompanyHeader companyDetail={companyDetail} allConfig={allConfig} isAuthenticated={isAuthenticated} currentUser={currentUser} isLoadingFollow={followMutation.isPending} handleFollow={handleFollow} setOpenSharePopup={setOpenSharePopup} t={t} />
          <Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Card sx={{ p: 3, boxShadow: (theme: Theme) => (theme as unknown as { customShadows?: Record<string, string> }).customShadows?.small || 1 }}>
                  <Stack spacing={4}>
                    <CompanyAbout companyDetail={companyDetail} safeDescriptionHtml={safeDescriptionHtml} t={t} />
                    <Box>
                      <Typography variant="h5" gutterBottom sx={{ color: "primary.main", fontWeight: 600, mb: 3 }}>
                        {t("companyDetail.hiring")}
                      </Typography>
                      <FilterJobPostCard params={{ companyId: companyDetail.id }} />
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
    </>
  );
};

export default CompanyDetailPage;
