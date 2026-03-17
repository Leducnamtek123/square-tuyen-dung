import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import routesConfig from "../configs/routesConfig";
import { HOST_NAME, ROUTES } from "../configs/constants";
import { getLocalizedRouteVariants, localizeRoutePath } from "../configs/routeLocalization";

const PrivateRoute = ({ element: Element, checkCondition, redirectUrl, settings }) => {
  if (checkCondition && !checkCondition(settings)) {
    return <Navigate to={redirectUrl} replace />;
  }

  return Element;
};

const renderRoutes = (routes, settings) => {
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

    const childrenRoutes = children && renderRoutes(children, settings);
    const wrappedElement = checkCondition ? (
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
        {childrenRoutes}
      </Route>
    ));
  });
};

const AppRoutes = ({ settings }) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const localizedPath = localizeRoutePath(location.pathname, i18n.language);
    if (localizedPath !== location.pathname) {
      navigate(`${localizedPath}${location.search}${location.hash}`, { replace: true });
    }
  }, [i18n.language, location.pathname, location.search, location.hash, navigate]);

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
