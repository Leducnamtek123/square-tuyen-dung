import React from 'react';
import 'react-image-gallery/styles/css/image-gallery.css';
// @ts-ignore
import ImageGallery from 'react-image-gallery';

interface ImageGalleryCustomProps {
  images: any[];
}

const ImageGalleryCustom = ({ images }: ImageGalleryCustomProps) => {
  return <ImageGallery showPlayButton={false} items={images} />;
};

export default ImageGalleryCustom;
