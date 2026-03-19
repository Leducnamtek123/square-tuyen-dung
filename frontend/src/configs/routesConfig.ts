import { HOST_NAME } from "./constants";
import ProjectRoutes from "./routes/ProjectRoutes";
import employerRoutes from "./routes/employerRoutes";
import adminRoutes from "./routes/adminRoutes";

const routesConfig = {
  [HOST_NAME.PROJECT]: ProjectRoutes,
  [HOST_NAME.EMPLOYER_PROJECT]: employerRoutes,
  [HOST_NAME.ADMIN_PROJECT]: adminRoutes,
};

export default routesConfig;


