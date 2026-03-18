// @ts-nocheck
import React from 'react';

interface Props {
  [key: string]: any;
}



const SvgIcon = ({ src, ...props }: Props) => {
  return (
    <div style={{ display: 'inline-block' }} {...props}>
      <img src={src} alt="" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default SvgIcon; 