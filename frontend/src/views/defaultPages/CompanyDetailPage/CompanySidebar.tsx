import React from 'react';
import { Box, Card, Stack, Typography, Link, IconButton } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faEnvelope, faPhoneVolume, faHashtag, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FacebookIcon, YoutubeIcon, LinkedinIcon } from "../../../components/Common/SocialIcons";
import Map from "../../../components/Common/Map";
import ImageGalleryCustom from "../../../components/Common/ImageGalleryCustom";
import VerifiedIcon from "@mui/icons-material/Verified";

import type { Theme as StylesTheme } from '@mui/material/styles';
import type { Company } from '@/types/models';
import type { TFunction } from 'i18next';
import type { CompanyDetailProps } from './types';
import { getSafeExternalOpenUrl } from '@/utils/safeExternalUrl';

interface CompanySidebarProps {
  companyDetail: CompanyDetailProps;
  imageList: { original: string; thumbnail?: string }[];
  t: TFunction;
}

const CompanySidebar: React.FC<CompanySidebarProps> = ({ companyDetail, imageList, t }) => {
  const safeWebsiteUrl = getSafeExternalOpenUrl(companyDetail.websiteUrl);
  const safeFacebookUrl = getSafeExternalOpenUrl(companyDetail.facebookUrl);
  const safeYoutubeUrl = getSafeExternalOpenUrl(companyDetail.youtubeUrl);
  const safeLinkedinUrl = getSafeExternalOpenUrl(companyDetail.linkedinUrl);

  return (
    <Card sx={{ p: 3, boxShadow: (theme: StylesTheme) => theme.customShadows?.small || 1 }}>
      <Stack spacing={3}>
        {companyDetail.isVerified && (
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.100' }}>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main', fontWeight: 700 }}>
              <VerifiedIcon fontSize="small" />
              {t("companyDetail.verified")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {t("companyDetail.verifiedDescription")}
            </Typography>
          </Box>
        )}
        {/* Website */}
        <Box>
          <Typography variant="h6" sx={{ color: "primary.main", mb: 2 }}>
            {t("companyDetail.website")}
          </Typography>
          <Typography sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary", "& svg": { color: "primary.main" } }}>
            <FontAwesomeIcon icon={faGlobe} />
            {safeWebsiteUrl ? (
              <Link target="_blank" rel="noopener noreferrer" href={safeWebsiteUrl} sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                {companyDetail.websiteUrl}
              </Link>
            ) : companyDetail.websiteUrl ? (
              <span>{companyDetail.websiteUrl}</span>
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
            {safeFacebookUrl && (
              <IconButton component="a" color="primary" aria-label="facebook" href={safeFacebookUrl} target="_blank" rel="noopener noreferrer">
                <FacebookIcon size={30} />
              </IconButton>
            )}
            {safeYoutubeUrl && (
              <IconButton component="a" color="primary" aria-label="youtube" href={safeYoutubeUrl} target="_blank" rel="noopener noreferrer">
                <YoutubeIcon size={30} />
              </IconButton>
            )}
            {safeLinkedinUrl && (
              <IconButton component="a" color="primary" aria-label="linkedin" href={safeLinkedinUrl} target="_blank" rel="noopener noreferrer">
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


