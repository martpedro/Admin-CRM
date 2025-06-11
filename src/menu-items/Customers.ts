/*** This is example of menu item without group for horizontal layout. There will be no children. ***/

// assets
import { Profile2User } from 'iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  customer: Profile2User
};

// ==============================|| MENU ITEMS - SAMPLE PAGE ||============================== //

const customer: NavItemType = {
  id: 'customers',
  title: 'Clientes',
  type: 'group',
  url: '/customer/customer-list',
  icon: icons.customer
};

export default customer;
