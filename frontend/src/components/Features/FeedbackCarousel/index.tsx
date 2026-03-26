// import 'swiper/css';
// import 'swiper/css/pagination';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pagination, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Box } from "@mui/material";
import FeedbackCard from '@/components/Features/FeedbackCard';
import contentService from '@/services/contentService';
import NoDataCard from '@/components/Common/NoDataCard';

interface FeedbackCarouselProps {
  [key: string]: any;
}

const styles: any = {
  ".swiper-pagination": {
    bottom: "-5px !important",
  },
  ".swiper-wrapper": {
    paddingBottom: "30px",
  },
  ".swiper-pagination-bullet": {
    width: 15,
    height: 15,
    opacity: 0.5,
    backgroundColor: "#8b6bd4",
  },
  ".swiper-pagination-bullet-active": {
    width: 15,
    height: 15,
    opacity: 1,
  },
};

const FeedbackCarousel = (_props: FeedbackCarouselProps) => {
  const [parentWidth, setParentWidth] = React.useState(0);
  const [col, setCol] = React.useState(5);

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ['feedbacks'],
    queryFn: async () => {
      const resData: any = await contentService.getFeedbacks();
      return resData || [];
    },
    staleTime: 10 * 60_000, // feedbacks change rarely, cache 10 min
  });

  React.useEffect(() => {
    const handleResize = () => {
      const element = document.getElementById('feed-back-carousel');
      if (element) {
        setParentWidth(element.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (parentWidth < 600) {
      setCol(2);
    } else if (parentWidth < 900) {
      setCol(3);
    } else {
      setCol(4);
    }
  }, [parentWidth]);

  return (
    <div id="feed-back-carousel">
      <Box sx={styles}>
        {isLoading ? (
          <Swiper
            slidesPerView={col}
            spaceBetween={30}
            pagination={{
              clickable: true,
            }}
            autoplay={{
              delay: 2500,
              disableOnInteraction: true,
            }}
            modules={[Pagination, Autoplay]}
          >
            {Array.from(Array(5).keys()).map((item) => (
              <SwiperSlide key={item}>
                <FeedbackCard.Loading />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : feedbacks.length === 0 ? (
          <NoDataCard title="Chưa có người dùng nào đánh giá" />
        ) : (
          <Swiper
            slidesPerView={col}
            spaceBetween={30}
            pagination={{
              clickable: true,
            }}
            autoplay={{
              delay: 2500,
              disableOnInteraction: true,
            }}
            modules={[Pagination, Autoplay]}
          >
            {feedbacks.map((value: any) => (
              <SwiperSlide key={value.id}>
                <FeedbackCard
                  avatarUrl={value?.userDict?.avatarUrl}
                  fullName={value?.userDict?.fullName}
                  content={value?.content}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </Box>
    </div>
  );
};

export default FeedbackCarousel;
