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

  // 1. Phỏng vấn ứng viên - luôn ưu tiên
  const isCandidateRoute = pathname === candidatePrefix || pathname.startsWith(`${candidatePrefix}/`);
  if (isCandidateRoute) {
    return <Routes>{renderRoutes(routesConfig[HOST_NAME.MYJOB], settings)}</Routes>;
  }

  // 2. Nhận diện Portal dựa trên Path (Dành cho trường hợp 1 domain: tuyendung.com/admin, tuyendung.com/employee)
  if (pathname.startsWith('/admin')) {
    return (
      <Routes>
        <Route path="/admin">
          {renderRoutes(routesConfig[HOST_NAME.ADMIN_MYJOB], settings)}
        </Route>
        {/* Fallback nếu không khớp route nào trong admin */}
        <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  if (pathname.startsWith('/employee')) {
    return (
      <Routes>
        <Route path="/employee">
          {renderRoutes(routesConfig[HOST_NAME.EMPLOYER_MYJOB], settings)}
        </Route>
        <Route path="/employee/*" element={<Navigate to="/employee" replace />} />
      </Routes>
    );
  }

  // 3. Logic cũ dựa trên Hostname (Cho trường hợp dùng Subdomain: admin.tuyendung.com)
  const routes = routesConfig[hostName] || routesConfig[HOST_NAME.MYJOB];
  return <Routes>{renderRoutes(routes, settings)}</Routes>;
};

export default AppRoutes;
