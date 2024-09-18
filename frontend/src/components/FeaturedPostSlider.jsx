// src/components/FeaturedPostSlider.jsx

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import PostCard from './PostCard';

function FeaturedPostSlider({ featuredPosts, user, onLike }) {
  return (
    <div className="mb-12">
      <h2 className="text-4xl font-bold mb-8 text-nfl-blue dark:text-nfl-white">Featured Posts</h2>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        loop
        className="rounded-2xl shadow-lg"
      >
        {featuredPosts.map(post => (
          <SwiperSlide key={post._id}>
            <PostCard post={post} user={user} onLike={onLike} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default FeaturedPostSlider;
