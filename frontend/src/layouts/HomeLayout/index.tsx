import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/commons/Header';
import SubHeader from '../components/commons/SubHeader';
import TopSlide from '../components/commons/TopSlide';
import Footer from '../components/commons/Footer';

const HomeLayout = () => {

  return (
    <div>
      <Header />
      <SubHeader />
      <div className="w-full">
        <section>
          <TopSlide />
        </section>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section>
          <Outlet />
        </section>
      </div>
      <div className="mt-10 border-t border-border bg-background px-4 py-4 text-foreground sm:px-8 lg:px-12 lg:py-8">
        <Footer />
      </div>
    </div>
  );

};

export default HomeLayout;
