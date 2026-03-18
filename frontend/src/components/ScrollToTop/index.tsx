// @ts-nocheck
import { useEffect } from 'react';

import { useLocation } from 'react-router-dom';

interface Props {
  [key: string]: any;
}



const ScrollToTop = (_props: Props) => {

  const { pathname } = useLocation();

  useEffect(() => {

    window.scrollTo(0, 0);

  }, [pathname]);

  return null;

};

export default ScrollToTop;
