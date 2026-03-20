import * as React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/commons/Header';
import Footer from '../components/commons/Footer';

const DefaultLayout = () => {

  return (
    <div>
      <Header />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <section>
          <Outlet />
        </section>
      </div>
      <div className="mt-8 border-t border-border bg-background px-4 py-4 text-foreground sm:mt-10 sm:px-8 lg:px-12 lg:py-8">
        <Footer />
      </div>
    </div>
  );

};

export default DefaultLayout;
