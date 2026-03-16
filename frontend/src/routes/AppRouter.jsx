import { Routes, Route, Navigate } from "react-router-dom";
import routesConfig from "../configs/routesConfig";
import { HOST_NAME, ROUTES } from "../configs/constants";

const PrivateRoute = ({ element: Element, checkCondition, redirectUrl, settings }) => {
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
  const pathname = window.location.pathname || "/";
  const jobSeekerInterviewPrefix = `/${ROUTES.JOBSEEKER_INTERVIEW.INTERVIEW.replace('/:id', '')}`;
  const employerPrefixes = ["/employer", "/employee"];

  // Candidate interview flow always uses root routes.
  const isJobSeekerInterviewRoute =
    pathname === jobSeekerInterviewPrefix || pathname.startsWith(`${jobSeekerInterviewPrefix}/`);
  if (isJobSeekerInterviewRoute) {
    return <Routes>{renderRoutes(routesConfig[HOST_NAME.MYJOB], settings)}</Routes>;
  }

  // Path-based portals: BrowserRouter basename already strips /admin or /employer.
  if (pathname.startsWith("/admin")) {
    return <Routes>{renderRoutes(routesConfig[HOST_NAME.ADMIN_MYJOB], settings)}</Routes>;
  }

  if (employerPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return <Routes>{renderRoutes(routesConfig[HOST_NAME.EMPLOYER_MYJOB], settings)}</Routes>;
  }

  // Legacy subdomain-based routing fallback.
  const routes = routesConfig[hostName] || routesConfig[HOST_NAME.MYJOB];
  return <Routes>{renderRoutes(routes, settings)}</Routes>;
};

export default AppRoutes;
