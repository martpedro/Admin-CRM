// project-imports
import { handlerCustomerDialog } from 'api/customer';
import { NavActionType } from 'config';

// assets
import { Add, Link1, KyberNetwork, Profile2User, UserSquare } from 'iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  applications: KyberNetwork,
  customer: Profile2User,
  profile: UserSquare,
  add: Add,
  link: Link1
};

// ==============================|| MENU ITEMS - APPLICATIONS ||============================== //

const applications: NavItemType = {
  id: 'group-applications',
  title: 'aplicaciones',
  icon: icons.applications,
  type: 'group',
  children: [
    {
      id: 'customer',
      title: 'cliente',
      type: 'collapse',
      icon: icons.customer,
      children: [
        {
          id: 'customer-list',
          title: 'lista',
          type: 'item',
          url: '/apps/customer/customer-list',
          actions: [
            {
              type: NavActionType.FUNCTION,
              label: 'Agregar Cliente',
              function: () => handlerCustomerDialog(true),
              icon: icons.add
            }
          ]
        },
        {
          id: 'customer-card',
          title: 'tarjetas',
          type: 'item',
          url: '/apps/customer/customer-card'
        }
      ]
    },
    {
      id: 'dashboard',
      title: 'Inicio',
      type: 'item',
      url: '/inicio'
    },
    {
      id: 'profile',
      title: 'perfil',
      type: 'collapse',
      icon: icons.profile,
      children: [
        {
          id: 'user-profile',
          title: 'perfil-usuario',
          type: 'item',
          link: '/profiles/user/:tab',
          url: '/profiles/user/personal',
          breadcrumbs: false
        },
        {
          id: 'account-profile',
          title: 'perfil-cuenta',
          type: 'item',
          url: '/profiles/account/basic',
          link: '/profiles/account/:tab',
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default applications;
