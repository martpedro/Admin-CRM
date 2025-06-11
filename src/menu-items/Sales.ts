/*** This is example of menu item without group for horizontal layout. There will be no children. ***/

// assets
import { Bill } from 'iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  invoice: Bill
};

// ==============================|| MENU ITEMS - SAMPLE PAGE ||============================== //

const sales: NavItemType = {
  id: 'sales',
  title: 'sales',
  type: 'group',
  url: '/sales/invoice-list',
  icon: icons.invoice
};

export default sales;
