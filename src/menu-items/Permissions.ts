// assets
import { SecurityUser, Profile2User } from 'iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  permissions: SecurityUser,
  teams: Profile2User
};

// ==============================|| MENU ITEMS - PERMISSIONS ||============================== //

const Permissions: NavItemType = {
  id: 'permissions',
  title: 'Permisos',
  type: 'group',
  children: [
    {
      id: 'roles-list',
      title: 'Roles',
      type: 'item',
      url: '/permissions/roles',
      icon: icons.permissions
    },
    {
      id: 'permissions-list',
      title: 'Gestión de Permisos',
      type: 'item',
      url: '/permissions/list',
      icon: icons.permissions
    },
    {
      id: 'teams',
      title: 'Equipos',
      type: 'item',
      url: '/permissions/teams',
      icon: icons.teams
    }
  ]
};

export default Permissions;
