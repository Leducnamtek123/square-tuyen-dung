import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/commons/Header";
import TabBar from "../components/jobSeekers/TabBar";
import Footer from "../components/commons/Footer";

const JobSeekerLayout = () => {

  return (
    <div>
      <Header />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <TabBar />
      </div>
      <div className="mx-auto my-2 max-w-7xl px-4 sm:my-3 sm:px-6 lg:px-8">
        <Outlet />
      </div>
      <div className="mt-0 border-t border-border bg-background px-4 py-4 text-foreground sm:mt-2 sm:px-8 md:mt-6 lg:mt-8 lg:px-12 lg:py-8">
        <Footer />
      </div>
    </div>
  );

};

export default JobSeekerLayout;
