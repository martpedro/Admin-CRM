/*** This is example of menu item without group for horizontal layout. There will be no children. ***/

// assets
import { UserSquare } from 'iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  users: UserSquare
};

// ==============================|| MENU ITEMS - SAMPLE PAGE ||============================== //

const Users: NavItemType = {
  id: 'users',
  title: 'Usuarios',
  type: 'group',
  url: '/user/user-list',
  // url: '/users',
  icon: icons.users
};

export default Users;
