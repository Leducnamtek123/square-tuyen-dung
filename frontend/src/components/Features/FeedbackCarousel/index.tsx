'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pagination, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Box, Button, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FeedbackCard, { type FeedbackUserType } from '@/components/Features/FeedbackCard';
import contentService from '@/services/contentService';
import NoDataCard from '@/components/Common/NoDataCard';
import type { Feedback } from '@/types/models';

const styles = {
  '.swiper-pagination': {
    bottom: '0px !important',
  },
  '.swiper-wrapper': {
    paddingBottom: '32px',
  },
  '.swiper-pagination-bullet': {
    width: 10,
    height: 10,
    opacity: 0.35,
    backgroundColor: '#64748b',
    transition: 'all 0.25s ease',
  },
  '.swiper-pagination-bullet-active': {
    width: 24,
    borderRadius: '6px',
    opacity: 1,
    backgroundColor: '#2563eb',
  },
};

interface EnrichedFeedbackItem {
  id: string | number;
  avatarUrl?: string;
  fullName: string;
  roleTitle: string;
  companyName?: string;
  userType: FeedbackUserType;
  rating: number;
  content: string;
  impactTag: string;
  verified?: boolean;
}

const DEFAULT_EMPLOYER_FEEDBACKS: EnrichedFeedbackItem[] = [
  {
    id: 'emp-1',
    fullName: 'Nguyễn Đình Thơ',
    roleTitle: 'Head of Talent Acquisition',
    companyName: 'Square Studio',
    userType: 'employer',
    rating: 5,
    content:
      'Hệ thống sàng lọc hồ sơ tự động và phòng phỏng vấn trực tuyến giúp đội ngũ tuyển dụng rút ngắn 50% thời gian tìm kiếm nhân sự chất lượng cao.',
    impactTag: 'Tuyển 12 Senior Architect trong Q3',
    verified: true,
    avatarUrl: '/images/testimonials/avatar-2.jpg',
  },
  {
    id: 'emp-2',
    fullName: 'Minh Thuận',
    roleTitle: 'Giám đốc Nhân sự',
    companyName: 'Vinhomes Central',
    userType: 'employer',
    rating: 5,
    content:
      'Square Tuyển Dụng mang lại nguồn ứng viên chất lượng đúng chuyên ngành Xây dựng & Bất động sản, tỷ lệ nhận việc đạt hơn 85%.',
    impactTag: 'Đã tuyển 25+ chuyên viên BĐS',
    verified: true,
    avatarUrl: '/images/testimonials/avatar-1.jpg',
  },
  {
    id: 'emp-3',
    fullName: 'Hoàng Linh',
    roleTitle: 'Talent Lead',
    companyName: 'FPT Software',
    userType: 'employer',
    rating: 5,
    content:
      'Giao diện quản trị tuyển dụng trực quan, các tính năng lên lịch phỏng vấn và gửi thư mời tự động cực kỳ chuyên nghiệp và chuẩn chỉ.',
    impactTag: 'Tối ưu 60% quy trình phỏng vấn',
    verified: true,
    avatarUrl: '/images/testimonials/avatar-3.jpg',
  },
  {
    id: 'emp-4',
    fullName: 'Trần Quốc Bảo',
    roleTitle: 'Giám đốc Điều hành',
    companyName: 'BIM Tech Design',
    userType: 'employer',
    rating: 5,
    content:
      'Nền tảng giúp công ty tiếp cận được những ứng viên tài năng trong ngành Kiến trúc và Nội thất một cách nhanh chóng và bảo mật nhất.',
    impactTag: 'Đủ đội ngũ thiết kế sau 10 ngày',
    verified: true,
    avatarUrl: '/images/testimonials/avatar-4.jpg',
  },
];

const DEFAULT_CANDIDATE_FEEDBACKS: EnrichedFeedbackItem[] = [
  {
    id: 'cand-1',
    fullName: 'Thế Châu',
    roleTitle: 'Senior Fullstack Dev',
    companyName: 'TechCorp',
    userType: 'candidate',
    rating: 5,
    content:
      'Rất hài lòng với tính năng lọc job theo ngành và thành phố. Nộp CV trực tuyến cực kỳ mượt mà, mình đã nhận offer chỉ sau 4 ngày.',
    impactTag: 'Nhận Offer Senior Dev sau 4 ngày',
    verified: true,
    avatarUrl: '/images/testimonials/avatar-3.jpg',
  },
  {
    id: 'cand-2',
    fullName: 'Lê Ngọc Mai',
    roleTitle: 'Kiến trúc sư cảnh quan',
    companyName: 'Square Studio',
    userType: 'candidate',
    rating: 5,
    content:
      'Hệ thống gợi ý việc làm rất chính xác với năng lực và kỳ vọng mức lương của mình. Trải nghiệm phỏng vấn online rất tiện lợi.',
    impactTag: 'Tìm được việc ưng ý đúng ngành',
    verified: true,
    avatarUrl: '/images/testimonials/avatar-1.jpg',
  },
  {
    id: 'cand-3',
    fullName: 'Đặng Văn Nam',
    roleTitle: 'Kỹ sư Giám sát Xây dựng',
    companyName: 'Coteccons',
    userType: 'candidate',
    rating: 5,
    content:
      'Thông tin tuyển dụng minh bạch, rõ ràng về mức lương và chế độ đãi ngộ. Nền tảng tuyển dụng cực kỳ tiện ích cho anh em ngành xây dựng.',
    impactTag: 'Được 3 công ty mời phỏng vấn',
    verified: true,
    avatarUrl: '/images/testimonials/avatar-2.jpg',
  },
  {
    id: 'cand-4',
    fullName: 'Phạm Thanh Trúc',
    roleTitle: 'Chuyên viên Tư vấn BĐS',
    companyName: 'Đất Xanh Group',
    userType: 'candidate',
    rating: 5,
    content:
      'Cẩm nang nghề nghiệp rất hữu ích, hỗ trợ mình chuẩn bị CV và phỏng vấn tự tin hơn rất nhiều. Rất cảm ơn nền tảng!',
    impactTag: 'Ký hợp đồng chính thức sau 1 tuần',
    verified: true,
    avatarUrl: '/images/testimonials/avatar-4.jpg',
  },
];

type TabType = 'all' | 'employer' | 'candidate';

const FeedbackCarousel = () => {
  const { t } = useTranslation('public');
  const [selectedTab, setSelectedTab] = React.useState<TabType>('all');

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ['feedbacks'],
    queryFn: () => contentService.getFeedbacks(),
    staleTime: 10 * 60_000,
  });

  const enrichedFeedbacks = React.useMemo<EnrichedFeedbackItem[]>(() => {
    if (feedbacks.length === 0) {
      return [...DEFAULT_EMPLOYER_FEEDBACKS, ...DEFAULT_CANDIDATE_FEEDBACKS];
    }

    const merged = feedbacks.map((item: Feedback, index: number): EnrichedFeedbackItem => {
      const isEven = index % 2 === 0;
      const defaultPool = isEven ? DEFAULT_EMPLOYER_FEEDBACKS : DEFAULT_CANDIDATE_FEEDBACKS;
      const fallbackItem = defaultPool[index % defaultPool.length];

      return {
        id: item.id,
        avatarUrl: item?.userDict?.avatarUrl || fallbackItem.avatarUrl,
        fullName: item?.userDict?.fullName || fallbackItem.fullName,
        roleTitle: fallbackItem.roleTitle,
        companyName: fallbackItem.companyName,
        userType: fallbackItem.userType,
        rating: item.rating || fallbackItem.rating,
        content: item.content || fallbackItem.content,
        impactTag: fallbackItem.impactTag,
        verified: true,
      };
    });

    if (merged.length < 4) {
      const existingNames = new Set(merged.map((m) => m.fullName));
      const pool = [...DEFAULT_EMPLOYER_FEEDBACKS, ...DEFAULT_CANDIDATE_FEEDBACKS];
      pool.forEach((item) => {
        if (!existingNames.has(item.fullName)) {
          merged.push(item);
        }
      });
    }

    return merged;
  }, [feedbacks]);

  const filteredFeedbacks = React.useMemo(() => {
    if (selectedTab === 'all') return enrichedFeedbacks;
    return enrichedFeedbacks.filter((item) => item.userType === selectedTab);
  }, [enrichedFeedbacks, selectedTab]);

  return (
    <Box id="feed-back-carousel">
      {/* Category Tab Bar */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          mb: 3.5,
          flexWrap: 'wrap',
          gap: { xs: 1, sm: 1.25 },
        }}
      >
        <Button
          variant={selectedTab === 'all' ? 'contained' : 'outlined'}
          onClick={() => setSelectedTab('all')}
          size="small"
          sx={{
            borderRadius: '9999px',
            textTransform: 'none',
            fontWeight: 600,
            px: { xs: 1.75, sm: 2.25 },
            py: 0.75,
            fontSize: '0.85rem',
            transition: 'background-color 0.2s ease',
            ...(selectedTab === 'all'
              ? {
                  bgcolor: '#2563eb',
                  color: '#ffffff',
                  borderColor: '#2563eb',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#1d4ed8',
                    borderColor: '#1d4ed8',
                  },
                }
              : {
                  borderColor: '#e2e8f0',
                  color: '#475569',
                  bgcolor: '#ffffff',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#e2e8f0',
                    bgcolor: '#f8fafc',
                  },
                }),
          }}
        >
          {t('home.feedbackAll')}
        </Button>

        <Button
          variant={selectedTab === 'employer' ? 'contained' : 'outlined'}
          onClick={() => setSelectedTab('employer')}
          size="small"
          sx={{
            borderRadius: '9999px',
            textTransform: 'none',
            fontWeight: 600,
            px: { xs: 1.75, sm: 2.25 },
            py: 0.75,
            fontSize: '0.85rem',
            transition: 'background-color 0.2s ease',
            ...(selectedTab === 'employer'
              ? {
                  bgcolor: '#2563eb',
                  color: '#ffffff',
                  borderColor: '#2563eb',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#1d4ed8',
                    borderColor: '#1d4ed8',
                  },
                }
              : {
                  borderColor: '#e2e8f0',
                  color: '#475569',
                  bgcolor: '#ffffff',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#e2e8f0',
                    bgcolor: '#f8fafc',
                  },
                }),
          }}
        >
          {t('home.feedbackEmployers')}
        </Button>

        <Button
          variant={selectedTab === 'candidate' ? 'contained' : 'outlined'}
          onClick={() => setSelectedTab('candidate')}
          size="small"
          sx={{
            borderRadius: '9999px',
            textTransform: 'none',
            fontWeight: 600,
            px: { xs: 1.75, sm: 2.25 },
            py: 0.75,
            fontSize: '0.85rem',
            transition: 'background-color 0.2s ease',
            ...(selectedTab === 'candidate'
              ? {
                  bgcolor: '#2563eb',
                  color: '#ffffff',
                  borderColor: '#2563eb',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#1d4ed8',
                    borderColor: '#1d4ed8',
                  },
                }
              : {
                  borderColor: '#e2e8f0',
                  color: '#475569',
                  bgcolor: '#ffffff',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#e2e8f0',
                    bgcolor: '#f8fafc',
                  },
                }),
          }}
        >
          {t('home.feedbackCandidates')}
        </Button>
      </Stack>

      <Box sx={styles}>
        {isLoading ? (
          <Swiper
            breakpoints={{
              0: { slidesPerView: 1, spaceBetween: 16 },
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
            }}
            pagination={{ clickable: true }}
            modules={[Pagination, Autoplay]}
          >
            {Array.from(Array(4).keys()).map((item) => (
              <SwiperSlide key={item}>
                <FeedbackCard.Loading />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : filteredFeedbacks.length === 0 ? (
          <NoDataCard title={t('home.noFeedbacks')} />
        ) : (
          <Swiper
            key={selectedTab}
            breakpoints={{
              0: { slidesPerView: 1, spaceBetween: 16 },
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
            }}
            pagination={{ clickable: true }}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            modules={[Pagination, Autoplay]}
          >
            {filteredFeedbacks.map((value: EnrichedFeedbackItem) => (
              <SwiperSlide key={value.id}>
                <FeedbackCard
                  id={value.id}
                  avatarUrl={value.avatarUrl}
                  fullName={value.fullName}
                  roleTitle={value.roleTitle}
                  companyName={value.companyName}
                  userType={value.userType}
                  rating={value.rating}
                  content={value.content}
                  impactTag={value.impactTag}
                  verified={value.verified}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </Box>
    </Box>
  );
};

export default FeedbackCarousel;

