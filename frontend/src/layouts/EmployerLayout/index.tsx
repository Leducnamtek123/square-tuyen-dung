import * as React from 'react';

import { Outlet } from 'react-router-dom';

import PropTypes from 'prop-types';


import Header from '../components/employers/Header';

import Sidebar from '../components/employers/Sidebar';

interface EmployerLayoutProps {
  window?: () => Window;
}



const drawerWidth = 240;

function EmployerLayout(props: EmployerLayoutProps) {

  const { window } = props;

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {

    setMobileOpen(!mobileOpen);

  };

  const container =

    window !== undefined ? () => window().document.body : undefined;

  return (
    <div className="flex">

      {/* Start: Header */}

      <Header

        drawerWidth={drawerWidth}

        handleDrawerToggle={handleDrawerToggle}

      />

      {/* End: Header */}

      <nav className="shrink-0 xl:w-[240px]">

        {/* Start: Sidebar */}

        <Sidebar drawerWidth={drawerWidth} isAdmin={false} />
        <Sidebar.MobileSidebar
          drawerWidth={drawerWidth}
          container={container}
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          isAdmin={false}
        />

        {/* End: Sidebar */}

      </nav>

      <main className="flex-1">

        {/* <Toolbar /> */}

        <div className="mt-7 p-2 sm:p-4">

          <Outlet />

        </div>

      </main>

    </div>

  );

}

EmployerLayout.propTypes = {

  /**

   * Injected by the documentation to work in an iframe.

   * You won't need it on your project.

   */

  window: PropTypes.func,

};

export default EmployerLayout;
