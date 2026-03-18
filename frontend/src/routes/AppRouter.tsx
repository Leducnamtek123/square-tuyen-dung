import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import routesConfig from "../configs/routesConfig";
import { HOST_NAME, ROUTES } from "../configs/constants";
import { getLocalizedRouteVariants } from "../configs/routeLocalization";
import { isAdminPortalPath, isEmployerPortalPath } from "../configs/portalRouting";

interface RouteConfig {
  path?: string;
  element?: React.ComponentType<any>;
  layouts?: React.ComponentType<any>;
  checkCondition?: (settings: any) => boolean;
  redirectUrl?: string;
  children?: RouteConfig[];
  index?: boolean;
}

interface PrivateRouteProps {
  element: React.ReactNode;
  checkCondition: (settings: any) => boolean;
  redirectUrl: string;
  settings: any;
}

const PrivateRoute = ({ element, checkCondition, redirectUrl, settings }: PrivateRouteProps) => {
  if (checkCondition && !checkCondition(settings)) {
    return <Navigate to={redirectUrl} replace />;
  }

  return <>{element}</>;
};

const renderRoutes = (routes: RouteConfig[], settings: any): React.ReactNode[] => {
  return routes.flatMap((route, index) => {
    const {
      path,
      element: Element,
      layouts: Layout,
      checkCondition,
      redirectUrl,
      children,
      index: isIndex,
    } = route;

    let routeElement: React.ReactNode = null;

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

    const childrenRoutes = children && renderRoutes(children, settings);
    const wrappedElement = checkCondition && redirectUrl ? (
      <PrivateRoute
        element={routeElement}
        checkCondition={checkCondition}
        settings={settings}
        redirectUrl={redirectUrl}
      />
    ) : (
      routeElement
    );

    const routePaths = isIndex
      ? [undefined]
      : typeof path === "string"
        ? getLocalizedRouteVariants(path)
        : [path];

    return routePaths.map((routePath, pathIndex) => (
      <Route
        key={`${index}-${pathIndex}-${routePath ?? "index"}`}
        {...(isIndex
          ? { index: true }
          : routePath !== undefined
            ? { path: routePath }
            : {})}
        element={wrappedElement}
      >
        {childrenRoutes as any}
      </Route>
    ));
  });
};

interface AppRoutesProps {
  settings: any;
}

const AppRoutes = ({ settings }: AppRoutesProps) => {
  useTranslation();

  const pathname = window.location.pathname || "/";
  const jobSeekerInterviewPrefix = `/${ROUTES.JOBSEEKER_INTERVIEW.INTERVIEW.replace('/:id', '')}`;

  // Candidate interview flow always uses root routes.
  const isJobSeekerInterviewRoute =
    pathname === jobSeekerInterviewPrefix || pathname.startsWith(`${jobSeekerInterviewPrefix}/`);
  
  if (isJobSeekerInterviewRoute) {
    const routes = routesConfig[HOST_NAME.PROJECT] as RouteConfig[];
    return <Routes>{renderRoutes(routes, settings)}</Routes>;
  }

  // Path-based portals: BrowserRouter basename already strips /admin or /employer.
  if (isAdminPortalPath(pathname)) {
    const routes = routesConfig[HOST_NAME.ADMIN_PROJECT] as RouteConfig[];
    return <Routes>{renderRoutes(routes, settings)}</Routes>;
  }

  if (isEmployerPortalPath(pathname)) {
    const routes = routesConfig[HOST_NAME.EMPLOYER_PROJECT] as RouteConfig[];
    return <Routes>{renderRoutes(routes, settings)}</Routes>;
  }

  // Legacy subdomain-based routing fallback.
  const hostName = window.location.hostname;
  const config = routesConfig as any;
  const routes = (config[hostName] || routesConfig[HOST_NAME.PROJECT]) as RouteConfig[];
  return <Routes>{renderRoutes(routes, settings)}</Routes>;
};

export default AppRoutes;
