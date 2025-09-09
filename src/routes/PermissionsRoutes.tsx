import { lazy } from 'react';

// project-imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';

const PermissionsList = Loadable(lazy(() => import('pages/apps/permissions/list')));
const Teams = Loadable(lazy(() => import('sections/apps/permissions/teams')));

// ==============================|| PERMISSIONS ROUTING ||============================== //

const PermissionsRoutes = {
  path: 'permissions',
  element: <DashboardLayout />,
  children: [
    {
      path: 'list',
      element: <PermissionsList />
    },
    {
      path: 'teams',
      element: <Teams />
    }
  ]
};

export default PermissionsRoutes;
