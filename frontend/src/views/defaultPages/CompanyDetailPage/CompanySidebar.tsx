import React from 'react';
import { Box, Card, Stack, Typography, Link, IconButton } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faEnvelope, faPhoneVolume, faHashtag, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FacebookIcon, YoutubeIcon, LinkedinIcon } from "../../../components/Common/SocialIcons";
import Map from "../../../components/Common/Map";
import ImageGalleryCustom from "../../../components/Common/ImageGalleryCustom";

import type { Theme as StylesTheme } from '@mui/material/styles';
import type { Company } from '@/types/models';
import type { TFunction } from 'i18next';
import type { CompanyDetailProps } from './types';

interface CompanySidebarProps {
  companyDetail: CompanyDetailProps;
  imageList: { original: string; thumbnail?: string }[];
  t: TFunction;
}

const CompanySidebar: React.FC<CompanySidebarProps> = ({ companyDetail, imageList, t }) => {
  return (
    <Card sx={{ p: 3, boxShadow: (theme: StylesTheme) => theme.customShadows?.small || 1 }}>
      <Stack spacing={3}>
        {/* Website */}
        <Box>
          <Typography variant="h6" sx={{ color: "primary.main", mb: 2 }}>
            {t("companyDetail.website")}
          </Typography>
          <Typography sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary", "& svg": { color: "primary.main" } }}>
            <FontAwesomeIcon icon={faGlobe} />
            {companyDetail.websiteUrl ? (
              <Link target="_blank" href={companyDetail.websiteUrl} sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                {companyDetail.websiteUrl}
              </Link>
            ) : (
              t("companyDetail.notUpdated")
            )}
          </Typography>
        </Box>
        {/* Social Media Links */}
        <Box>
          <Typography variant="h6" sx={{ color: "primary.main", mb: 2 }}>
            {t("companyDetail.followAt")}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ "& .MuiIconButton-root": { bgcolor: "grey.50", transition: "all 0.2s", "&:hover": { transform: "translateY(-2px)" } } }}>
            {companyDetail?.facebookUrl && (
              <IconButton component="a" color="primary" aria-label="facebook" href={companyDetail.facebookUrl} target="_blank">
                <FacebookIcon size={30} />
              </IconButton>
            )}
            {companyDetail?.youtubeUrl && (
              <IconButton component="a" color="primary" aria-label="youtube" href={companyDetail.youtubeUrl} target="_blank">
                <YoutubeIcon size={30} />
              </IconButton>
            )}
            {companyDetail?.linkedinUrl && (
              <IconButton component="a" color="primary" aria-label="linkedin" href={companyDetail.linkedinUrl} target="_blank">
                <LinkedinIcon size={30} />
              </IconButton>
            )}
          </Stack>
        </Box>
        {/* Company Info */}
        <Box>
          <Typography variant="h6" sx={{ color: "primary.main", mb: 2 }}>
            {t("companyDetail.generalInfo")}
          </Typography>
          <Stack spacing={2} sx={{ "& .MuiTypography-root": { display: "flex", alignItems: "center", gap: 1, color: "text.secondary", "& svg": { color: "primary.main" } } }}>
            <Typography>
              <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: 6 }} /> {companyDetail.companyEmail}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <FontAwesomeIcon icon={faPhoneVolume} style={{ marginRight: 6 }} /> {companyDetail.companyPhone}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <FontAwesomeIcon icon={faHashtag} style={{ marginRight: 6 }} /> {companyDetail.taxCode}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: 6 }} /> {companyDetail.location?.address || <span style={{ color: "#e0e0e0", fontStyle: "italic", fontSize: 13 }}>{t("companyDetail.notUpdated")}</span>}
            </Typography>
          </Stack>
        </Box>
        {/* Map */}
        <Box>
          <Typography variant="h6" sx={{ color: "primary.main", mb: 2 }}>
            {t("companyDetail.map")}
          </Typography>
          <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "grey.200" }}>
            <Map title={companyDetail?.companyName} subTitle={companyDetail?.location?.address} latitude={companyDetail?.location?.lat} longitude={companyDetail?.location?.lng} />
          </Box>
        </Box>
        {/* Image Gallery */}
        {imageList.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ color: "primary.main", mb: 2 }}>
              {t("companyDetail.images")}
            </Typography>
            <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "grey.200" }}>
              <ImageGalleryCustom images={imageList} />
            </Box>
          </Box>
        )}
      </Stack>
    </Card>
  );
};
export default CompanySidebar;


