import { createBrowserRouter } from 'react-router-dom';

// project import
import MainRoutes from './MainRoutes';
import LoginRoutes from './LoginRoutes';

// ==============================|| ROUTES RENDER ||============================== //

const router = createBrowserRouter(
  [
	...(Array.isArray(LoginRoutes) ? LoginRoutes : [LoginRoutes]),
	...(Array.isArray(MainRoutes) ? MainRoutes : [MainRoutes])
  ],
  { basename: import.meta.env.VITE_APP_BASE_NAME }
);

export default router;
