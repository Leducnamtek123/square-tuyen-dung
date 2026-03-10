/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import { Routes, Route, Navigate } from "react-router-dom";
import routesConfig from "../configs/routesConfig";
import { HOST_NAME } from "../configs/constants";

const PrivateRoute = ({
  element: Element,
  checkCondition,
  redirectUrl,
  settings,
}) => {
  if (checkCondition && !checkCondition(settings)) {
    return <Navigate to={redirectUrl} replace />;
  }
  return Element;
};

const renderRoutes = (routes, settings) => {
  return routes.map((route, index) => {
    const {
      path,
      element: Element,
      layouts: Layout,
      checkCondition,
      redirectUrl,
      children,
      index: isIndex,
    } = route;

    let routeElement;
    if (Element) {
      routeElement = Layout ? (
        <Layout>
          <Element />
        </Layout>
      ) : (
        <Element />
      );
    } else if (Layout) {
      routeElement = <Layout />;
    }

    if (checkCondition) {
      return (
        <Route
          key={index}
          {...(isIndex ? { index: true } : { path })}
          element={
            <PrivateRoute
              element={routeElement}
              checkCondition={checkCondition}
              settings={settings}
              redirectUrl={redirectUrl}
            />
          }
        >
          {children && renderRoutes(children, settings)}
        </Route>
      );
    }

    return (
      <Route
        key={index}
        {...(isIndex ? { index: true } : { path })}
        element={routeElement}
      >
        {children && renderRoutes(children, settings)}
      </Route>
    );
  });
};

const AppRoutes = ({ settings }) => {
  const hostName = window.location.hostname;
  // Fallback to MYJOB host if hostname is not recognized
  const routes = routesConfig[hostName] || routesConfig[HOST_NAME.MYJOB];

  return <Routes>{renderRoutes(routes, settings)}</Routes>;
};

export default AppRoutes;
