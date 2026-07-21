import React from 'react';
import Image from 'next/image';
const ImageAny: any = Image;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
}

const SvgIcon = ({ src, ...props }: Props) => {
  return (
    <div style={{ display: 'inline-block' }} {...props}>
      <ImageAny src={src} alt="" width={1} height={1} unoptimized style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default SvgIcon; 
