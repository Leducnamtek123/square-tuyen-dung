import { HOST_NAME } from "./constants";
import ProjectRoutes from "./routes/ProjectRoutes";
import employerRoutes from "./routes/employerRoutes";
import adminRoutes from "./routes/adminRoutes";

const routesConfig = {
  [HOST_NAME.Project]: ProjectRoutes,
  [HOST_NAME.EMPLOYER_Project]: employerRoutes,
  [HOST_NAME.ADMIN_Project]: adminRoutes,
};

export default routesConfig;


