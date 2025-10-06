import { lazy } from 'react';

// project-imports
import Loadable from 'components/Loadable';
import { SimpleLayoutType } from 'config';
import DashboardLayout from 'layout/Dashboard';
// import PagesLayout from 'layout/Dashboard/Pages'; // Removed because the module does not exist or is incorrectly referenced.
import SimpleLayout from 'layout/Simple';


// pages routing
const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/error/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/error/500')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('pages/maintenance/under-construction/under-construction')));
const MaintenanceUnderConstruction2 = Loadable(lazy(() => import('pages/maintenance/under-construction/under-construction2')));
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/coming-soon/coming-soon')));
const MaintenanceComingSoon2 = Loadable(lazy(() => import('pages/maintenance/coming-soon/coming-soon2')));
const AppCustomerList = Loadable(lazy(() => import('pages/apps/customer/list')));

const AppUserList = Loadable(lazy(() => import('pages/apps/user/list')));
const AppPermissionsList = Loadable(lazy(() => import('pages/apps/permissions/list')));
const AppRolesList = Loadable(lazy(() => import('pages/apps/roles/list')));
const PermissionsTeams = Loadable(lazy(() => import('sections/apps/permissions/teams')));
const PermissionsAssign = Loadable(lazy(() => import('pages/apps/permissions/assign')));

// Quotations pages
const AppQuotationsList = Loadable(lazy(() => import('pages/apps/quotations/list')));
const AppQuotationsCreate = Loadable(lazy(() => import('pages/apps/quotations/create')));
const AppQuotationsEdit = Loadable(lazy(() => import('pages/apps/quotations/edit')));
const AppCompanyList = Loadable(lazy(() => import('pages/apps/company/list')));

// Profile pages
const UserProfile = Loadable(lazy(() => import('pages/apps/profiles/user')));
const UserTabPersonal = Loadable(lazy(() => import('sections/apps/profiles/user/TabPersonal')));
const UserTabPassword = Loadable(lazy(() => import('sections/apps/profiles/user/TabPassword')));

const AccountProfile = Loadable(lazy(() => import('pages/apps/profiles/account')));
const AccountTabProfile = Loadable(lazy(() => import('sections/apps/profiles/account/TabProfile')));
const AccountTabPersonal = Loadable(lazy(() => import('sections/apps/profiles/account/TabPersonal')));
const AccountTabPassword = Loadable(lazy(() => import('sections/apps/profiles/account/TabPassword')));

const DashboardHome = Loadable(lazy(() => import('pages/dashboard')));

// console.log('AppInvoiceCreate', AppInvoiceList, AppInvoiceDetails, AppInvoiceEdit);
// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const ContactUS = Loadable(lazy(() => import('pages/contact-us')));

// ==============================|| MAIN ROUTES ||============================== //

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          index: true,
          element: <DashboardHome />
        },
        {
          path: 'inicio',
          element: <DashboardHome />
        },
        {
          path: 'sample-page',
          element: <SamplePage />
        },
        {
          path: 'customers',
          element: <AppCustomerList />
        },
        {
          path: 'users',
          element: <AppUserList />
        },
        {
          path: 'permissions',
          children: [
            {
              path: 'list',
              element: <AppPermissionsList />
            },
            {
              path: 'roles',
              element: <AppRolesList />
            },
            {
              path: 'teams',
              element: <PermissionsTeams />
            },
            {
              path: 'assign',
              element: <PermissionsAssign />
            }
          ]
        },
        {
          path: 'company',
          children: [
            {
              path: 'list',
              element: <AppCompanyList />
            }
          ]
        },
            {
              path: 'quotations',
              children: [
                { path: '', element: <AppQuotationsList /> },
                { path: 'create', element: <AppQuotationsCreate /> },
                { path: 'edit/:id', element: <AppQuotationsEdit /> }
              ]
            },
            {
              path: 'profiles',
              children: [
                {
                  path: 'account',
                  element: <AccountProfile />,
                  children: [
                    {
                      path: 'basic',
                      element: <AccountTabProfile />
                    },
                    {
                      path: 'personal',
                      element: <AccountTabPersonal />
                    },
                    {
                      path: 'password',
                      element: <AccountTabPassword />
                    }
                  ]
                },
                {
                  path: 'user',
                  element: <UserProfile />,
                  children: [
                    {
                      path: 'personal',
                      element: <UserTabPersonal />
                    },
                    {
                      path: 'password',
                      element: <UserTabPassword />
                    }
                  ]
                }
              ]
            }
      ]
    },
    {
      path: '/hi',
      element: <SimpleLayout layout={SimpleLayoutType.LANDING} />
    },
    {
      path: '/',
      element: <SimpleLayout layout={SimpleLayoutType.SIMPLE} />,
      children: [
        {
          path: 'contact-us',
          element: <ContactUS />
        }
      ]
    },

    {
      path: '/maintenance',
      // element: <PagesLayout />, // Removed because PagesLayout does not exist.
      children: [
        {
          path: '404',
          element: <MaintenanceError />
        },
        {
          path: '500',
          element: <MaintenanceError500 />
        },
        {
          path: 'under-construction',
          element: <MaintenanceUnderConstruction />
        },
        {
          path: 'under-construction2',
          element: <MaintenanceUnderConstruction2 />
        },
        {
          path: 'coming-soon',
          element: <MaintenanceComingSoon />
        },
        {
          path: 'coming-soon-2',
          element: <MaintenanceComingSoon2 />
        }
      ]
    },
    { path: '*', element: <MaintenanceError /> }
  ]
};

export default MainRoutes;
