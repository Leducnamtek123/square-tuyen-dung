import 'swiper/css';
import 'swiper/css/pagination';
import React from 'react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Box } from "@mui/material";
import FeedbackCard from '../FeedbackCard';
import ProjectService from '../../services/ProjectService';
import NoDataCard from '../NoDataCard';

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
  const [isLoading, setIsLoading] = React.useState(true);
  const [feedbacks, setFeedbacks] = React.useState<any[]>([]);
  const [parentWidth, setParentWidth] = React.useState(0);
  const [col, setCol] = React.useState(5);

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

  React.useEffect(() => {
    const getFeedbacksList = async () => {
      setIsLoading(true);
      try {
        const resData: any = await ProjectService.getFeedbacks();
        setFeedbacks(resData.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    getFeedbacksList();
  }, []);

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
            {feedbacks.map((value) => (
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
