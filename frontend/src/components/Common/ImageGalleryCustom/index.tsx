import React from 'react';
import 'react-image-gallery/styles/css/image-gallery.css';
// @ts-ignore
import ImageGallery from 'react-image-gallery';

interface ImageGalleryCustomProps {
  images: { original: string; thumbnail?: string }[];
}

const ImageGalleryCustom = ({ images }: ImageGalleryCustomProps) => {
  if (!images || images.length === 0) return null;

  return (
    <ImageGallery
      items={images}
      showPlayButton={false}
      showFullscreenButton={true}
      showThumbnails={images.length > 1}
      showNav={images.length > 1}
      lazyLoad={true}
      slideDuration={300}
    />
  );
};

export default ImageGalleryCustom;
