// @ts-nocheck
import React from 'react';

import 'react-image-gallery/styles/css/image-gallery.css';

import ImageGallery from 'react-image-gallery';

interface Props {
  [key: string]: any;
}



const ImageGalleryCustom = (props: Props) => {

  const { images } = props;

  return <ImageGallery showPlayButton={false} items={images} />;

};

export default ImageGalleryCustom;
