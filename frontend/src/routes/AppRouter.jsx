import { Routes, Route, Navigate } from "react-router-dom";

import routesConfig from "../configs/routesConfig";

import { HOST_NAME, ROUTES } from "../configs/constants";

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

  const pathname = window.location.pathname || "/";

  const candidatePrefix = `/${ROUTES.CANDIDATE.INTERVIEW.replace('/:id', '')}`;

  // Always route candidate interview URLs to MYJOB config, regardless of host

  const isCandidateRoute = pathname === candidatePrefix || pathname.startsWith(`${candidatePrefix}/`);

  // Fallback to MYJOB host if hostname is not recognized

  const routes = isCandidateRoute

    ? routesConfig[HOST_NAME.MYJOB]

    : routesConfig[hostName] || routesConfig[HOST_NAME.MYJOB];

  return <Routes>{renderRoutes(routes, settings)}</Routes>;

};

export default AppRoutes;
