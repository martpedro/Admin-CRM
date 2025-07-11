import { lazy } from 'react';

// project-imports
import Loadable from 'components/Loadable';
import { SimpleLayoutType } from 'config';
import DashboardLayout from 'layout/Dashboard';
import PagesLayout from 'layout/Pages';
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

const AppInvoiceCreate = Loadable(lazy(() => import('pages/apps/invoice/create')));
const AppInvoiceDashboard = Loadable(lazy(() => import('pages/apps/invoice/dashboard')));
const AppInvoiceList = Loadable(lazy(() => import('pages/apps/invoice/list')));
const AppInvoiceDetails = Loadable(lazy(() => import('pages/apps/invoice/details')));
const AppInvoiceEdit = Loadable(lazy(() => import('pages/apps/invoice/edit')));

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
          path: 'sample-page',
          element: <SamplePage />
        },
        {
          path: 'customer',
          children: [
            {
              path: 'customer-list',
              element: <AppCustomerList />
            }
          ]
        },
        {
          path: 'user',
          children: [
            {
              path: 'user-list',
              element: <AppUserList />
            }
          ]
        },
        {
          path: 'sales',
          children: [
            {
              path: 'invoice-list',
              element: <AppInvoiceList />,
              title: 'editar',
              
            },
            {
              path: 'dashboard',
              element: <AppInvoiceDashboard />
            },
            {
              path: 'create',
              element: <AppInvoiceCreate />
            },
            {
              path: 'details/:id',
              element: <AppInvoiceDetails />
            },
            {
              path: 'edit/:id',
              element: <AppInvoiceEdit />
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
      element: <PagesLayout />,
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
